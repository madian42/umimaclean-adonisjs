import Booking from '#bookings/models/booking'
import BookingStatuses from '#core/enums/booking_status_enum'
import type { HttpContext } from '@adonisjs/core/http'
import { findStatusCodesByDisplaySearch } from '#common/ui/lib/utils'
import BookingPhoto from '#bookings/models/booking_photo'
import BookingStatus from '#bookings/models/booking_status'
import logger from '@adonisjs/core/services/logger'
import { releaseShipModeSchema } from '#bookings/validators/booking_validator'
import db from '@adonisjs/lucid/services/db'
import { uploadPhotoSchema } from '#bookings/validators/photo_validator'
import BookingAction from '#bookings/models/booking_action'
import BookingActions from '#core/enums/booking_action_enum'

/**
 * Controller for staff to manage bookings workflow
 * Handles: viewing bookings, claiming stages, uploading photos, releasing stages
 */
export default class StaffBookingController {
  /**
   * Display paginated list of bookings for staff dashboard
   *
   * Business Logic:
   * - Users (non-staff) are redirected to booking creation
   * - Supports filtering by search term and status (today/active)
   * - Search covers: booking number, customer name, phone, address, status
   * - "today" filter: bookings ready for processing (not in pickup/delivery/waiting deposit)
   * - "active" filter: bookings currently being processed (pickup started but not delivered)
   */
  async index({ inertia, auth, response, request }: HttpContext) {
    const user = auth.getUserOrFail()

    // Security: Only staff can access dashboard
    if (user.isUser) {
      return response.redirect().toRoute('bookings.create')
    }

    // Pagination and filter parameters
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const status = request.input('status', 'today') // 'today' or 'active'

    // Convert display-friendly status names to internal status codes
    const statusCodesFromDisplay = findStatusCodesByDisplaySearch(search)

    // Build query with eager loading for related data
    const query = Booking.query()
      .preload('address')
      .preload('statuses', (statusQuery) => {
        statusQuery.orderBy('updated_at', 'desc') // Latest status first
      })

    // Apply search filter across multiple fields
    if (search) {
      query.where((builder) => {
        builder
          .where('number', 'like', `%${search}%`) // Search by booking number
          .orWhereHas('address', (addressBuilder) => {
            addressBuilder
              .where('name', 'like', `%${search}%`) // Customer name
              .orWhere('phone', 'like', `%${search}%`) // Phone number
              .orWhere('street', 'like', `%${search}%`) // Street address
          })
          .orWhereHas('statuses', (statusBuilder) => {
            statusBuilder.where('name', 'like', `%${search}%`) // Status name
          })

        // Include internal status codes if search matches display names
        if (statusCodesFromDisplay.length > 0) {
          builder.orWhereHas('statuses', (statusBuilder) => {
            statusBuilder.whereIn('name', statusCodesFromDisplay)
          })
        }
      })
    }

    // Filter by workflow status
    if (status === 'active') {
      // Active: Bookings in progress (pickup started, not yet delivered or waiting deposit)
      query.whereHas('statuses', (statusBuilder) => {
        statusBuilder
          .where('name', BookingStatuses.PICKUP_PROGRESS)
          .andWhereNot('name', BookingStatuses.DELIVERY)
          .andWhereNot('name', BookingStatuses.WAITING_DEPOSIT)
      })
    } else if (status === 'today') {
      // Today: Bookings ready for processing (not started, not in transit, paid)
      query.whereHas('statuses', (statusBuilder) => {
        statusBuilder
          .whereNot('name', BookingStatuses.PICKUP_PROGRESS)
          .andWhereNot('name', BookingStatuses.DELIVERY)
          .andWhereNot('name', BookingStatuses.WAITING_DEPOSIT)
      })
    }

    const bookings = await query.orderBy('created_at', 'asc').paginate(page, 10)

    return inertia.render('bookings/staff/index', {
      bookings,
      filters: {
        search,
        status,
        page,
      },
    })
  }

  /**
   * Allow staff to claim a booking stage (pickup/check/delivery)
   *
   * Business Logic:
   * - Staff claims a stage to prevent concurrent work by multiple staff
   * - Creates ATTEMPT_* action for audit trail
   * - Updates booking status to show stage is in progress
   * - If stage already completed (photo exists), redirect with error
   * - If another staff claimed the stage, redirect with error
   * - Creates status record to track workflow progression
   */
  async shipMode({ inertia, params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    // Security: Only staff can claim stages
    if (user.isUser) {
      return response.redirect().toRoute('bookings.create')
    }

    // Load booking with all related data
    const booking = await Booking.query()
      .where('number', params.id)
      .preload('address')
      .preload('statuses', (statusQuery) => {
        statusQuery.orderBy('updated_at', 'desc')
      })
      .preload('photos')
      .preload('shoes')
      .first()

    if (!booking) {
      session.flash('general_errors', 'Booking tidak ditemukan.')
      return response.redirect().toRoute('staff.dashboard')
    }

    // Check if stage is already completed (photo uploaded)
    const existingPhoto = await BookingPhoto.query()
      .where('booking_id', booking.id)
      .andWhere('stage', params.stage)
      .first()

    if (existingPhoto) {
      session.flash(
        'general_errors',
        'Tahap ini sudah selesai. Lepas tahap lain atau lanjut ke booking berikutnya.'
      )
      return response.redirect().toRoute('staff.dashboard')
    }

    // Map stage to attempt action for audit
    const actionMap: Record<string, BookingActions> = {
      pickup: BookingActions.ATTEMPT_PICKUP,
      check: BookingActions.ATTEMPT_CHECK,
      delivery: BookingActions.ATTEMPT_DELIVERY,
    }

    // Check if another staff has claimed this stage
    const existingAction = await BookingAction.query()
      .where('booking_id', booking.id)
      .andWhere('action', actionMap[params.stage])
      .orderBy('created_at', 'desc')
      .first()

    // Stage is locked by another staff member
    if (existingAction && existingAction.adminId !== user.id) {
      session.flash('general_errors', 'Tahap ini sudah diambil oleh staff lain.')
      return response.redirect().toRoute('staff.dashboard')
    }

    const trx = await db.transaction()

    try {
      // Create attempt action (only if not already exists)
      if (!existingAction) {
        await BookingAction.create(
          {
            bookingId: booking.id,
            adminId: user.id,
            action: actionMap[params.stage],
            note: null,
          },
          { client: trx }
        )
      }

      // Map stage to status update
      const stageStatusMap: Record<string, BookingStatuses> = {
        pickup: BookingStatuses.PICKUP_PROGRESS,
        check: BookingStatuses.INSPECTION,
        delivery: BookingStatuses.DELIVERY,
      }

      // Update booking status to show stage in progress
      if (stageStatusMap[params.stage]) {
        const existingStatus = await BookingStatus.query({ client: trx })
          .where('booking_id', booking.id)
          .andWhere('name', stageStatusMap[params.stage])
          .first()

        // Create status only if doesn't exist (avoid duplicates)
        if (!existingStatus) {
          await BookingStatus.create(
            { bookingId: booking.id, name: stageStatusMap[params.stage] },
            { client: trx }
          )
        }
      }

      await trx.commit()

      // Show camera interface for photo upload
      return inertia.render('bookings/staff/ship-mode', {
        booking,
        stage: params.stage,
      })
    } catch (error) {
      await trx.rollback()

      logger.error(`Error during ship mode operation: ${error.message}`)
      session.flash('general_errors', 'Terjadi kesalahan saat memproses permintaan Anda.')
      return response.redirect().toRoute('staff.dashboard')
    }
  }

  /**
   * Handle photo upload for a claimed stage
   *
   * Business Logic:
   * - Verifies staff has claimed the stage (ATTEMPT_* action exists)
   * - Saves photo to stage-specific directory
   * - Creates photo record linking to booking and staff
   * - Creates completion action (PICKUP/CHECK/DELIVERY) with photo reference
   * - Updates booking status to next stage
   * - Uses transaction to ensure data consistency
   */
  async uploadShipPhoto({ inertia, response, request, session, params, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(uploadPhotoSchema)

    const booking = await Booking.query().where('number', params.id).first()
    if (!booking) {
      session.flash('general_errors', 'Booking tidak ditemukan.')
      return response.redirect().back()
    }

    // Verify staff has claimed this stage
    const actionMap: Record<string, BookingActions> = {
      pickup: BookingActions.ATTEMPT_PICKUP,
      check: BookingActions.ATTEMPT_CHECK,
      delivery: BookingActions.ATTEMPT_DELIVERY,
    }

    const attemptAction = await BookingAction.query()
      .where('booking_id', booking.id)
      .andWhere('action', actionMap[params.stage])
      .andWhere('admin_id', user.id)
      .orderBy('created_at', 'desc')
      .first()

    if (!attemptAction) {
      session.flash('general_errors', 'Tahap belum diambil.')
      return response.redirect().back()
    }

    // Configure next status and storage directory per stage
    const stageConfig: Record<
      string,
      {
        status: BookingStatuses // Next status after photo upload
        directory: string // Storage directory
        action: BookingActions // Completion action
      }
    > = {
      pickup: {
        status: BookingStatuses.INSPECTION, // After pickup → inspection
        directory: 'pickups',
        action: BookingActions.PICKUP,
      },
      check: {
        status: BookingStatuses.WAITING_PAYMENT, // After check → payment
        directory: 'inspections',
        action: BookingActions.CHECK,
      },
      delivery: {
        status: BookingStatuses.COMPLETED, // After delivery → completed
        directory: 'deliveries',
        action: BookingActions.DELIVERY,
      },
    }

    const config = stageConfig[params.stage]
    const fileName = `${booking.number}.${payload.image.extname}`
    const relativePath = `${config.directory}/${fileName}`

    // Save file to disk
    await payload.image.moveToDisk(relativePath)

    const trx = await db.transaction()

    try {
      // Create photo record
      const bookingPhoto = await BookingPhoto.create(
        {
          bookingId: booking.id,
          adminId: user.id,
          stage: params.stage,
          path: relativePath,
          note: null,
        },
        { client: trx }
      )

      // Create completion action with photo reference (for audit)
      await BookingAction.create(
        {
          bookingId: booking.id,
          bookingPhotoId: bookingPhoto.id, // Links action to photo
          adminId: user.id,
          action: config.action,
          note: null,
        },
        { client: trx }
      )

      // Update booking status to next stage
      const existingStatus = await BookingStatus.query({ client: trx })
        .where('booking_id', booking.id)
        .andWhere('name', config.status)
        .first()

      if (!existingStatus) {
        await BookingStatus.create({ bookingId: booking.id, name: config.status }, { client: trx })
      }

      await trx.commit()

      // Show success page with uploaded photo
      return inertia.render('bookings/staff/upload-ship-photo', {
        bookingId: booking.id,
        stage: params.stage,
        photoUrl: relativePath,
      })
    } catch (error) {
      await trx.rollback()

      logger.error(`Error during photo upload: ${error.message}`)
      session.flash('general_errors', 'Terjadi kesalahan saat mengunggah foto.')
      return response.redirect().back()
    }
  }

  /**
   * Release a claimed stage without completing it
   *
   * Business Logic:
   * - Staff can release a stage they've claimed but not completed
   * - Verifies staff has claimed the stage (ATTEMPT_* action exists)
   * - Creates RELEASE_* action with optional note for audit
   * - Removes in-progress status to free up the stage
   * - Another staff can then claim the stage
   * - Useful when staff needs to switch tasks or encounters issues
   */
  async releaseShipMode({ inertia, session, response, params, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(releaseShipModeSchema)

    // Verify staff has claimed this stage
    const actionMap: Record<string, BookingActions> = {
      pickup: BookingActions.ATTEMPT_PICKUP,
      check: BookingActions.ATTEMPT_CHECK,
      delivery: BookingActions.ATTEMPT_DELIVERY,
    }

    const attemptAction = await BookingAction.query()
      .where('booking_id', params.id)
      .andWhere('action', actionMap[payload.stage])
      .andWhere('admin_id', user.id)
      .orderBy('created_at', 'desc')
      .first()

    if (!attemptAction) {
      session.flash('general_errors', 'Tahap belum diambil.')
      return response.redirect().back()
    }

    const trx = await db.transaction()

    try {
      // Map stage to release action
      const releaseActionMap: Record<string, BookingActions> = {
        pickup: BookingActions.RELEASE_PICKUP,
        check: BookingActions.RELEASE_CHECK,
        delivery: BookingActions.RELEASE_DELIVERY,
      }

      // Create release action with optional note (for audit)
      await BookingAction.create(
        {
          bookingId: params.id,
          adminId: user.id,
          action: releaseActionMap[payload.stage],
          note: payload.note || null, // Optional reason for release
        },
        { client: trx }
      )

      // Remove in-progress status to free up the stage
      const releaseStatusMap: Record<string, BookingStatuses> = {
        pickup: BookingStatuses.PICKUP_PROGRESS,
        check: BookingStatuses.INSPECTION,
        delivery: BookingStatuses.DELIVERY,
      }

      await BookingStatus.query({ client: trx })
        .where('booking_id', params.id)
        .andWhere('name', releaseStatusMap[payload.stage])
        .delete()

      await trx.commit()

      // Show confirmation page
      return inertia.render('bookings/staff/release-ship-mode')
    } catch (error) {
      await trx.rollback()

      logger.error(`Error during release: ${error.message}`)
      session.flash('general_errors', 'Terjadi kesalahan saat melepas tahap.')
      return response.redirect().back()
    }
  }
}
