import Booking from '#bookings/models/booking'
import BookingStatuses from '#core/enums/booking_status_enum'
import type { HttpContext } from '@adonisjs/core/http'
import { findStatusCodesByDisplaySearch } from '#common/ui/lib/utils'
import BookingPhoto from '#bookings/models/booking_photo'
import BookingStatus from '#bookings/models/booking_status'
import logger from '@adonisjs/core/services/logger'
import { releaseShipModeSchema } from '#bookings/validators/booking_validator'
import vine from '@vinejs/vine'

const uploadShipPhotoSchema = vine.compile(
  vine.object({
    image: vine.file({
      size: '5mb',
      extnames: ['png', 'jpg', 'jpeg'],
    }),
  })
)

export default class StaffBookingController {
  async index({ inertia, auth, response, request }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.isUser) {
      return response.redirect().toRoute('bookings.create')
    }

    // Get query parameters
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const status = request.input('status', 'today') // 'completed', 'active'

    const statusCodesFromDisplay = findStatusCodesByDisplaySearch(search)

    // Build the base query
    const query = Booking.query()
      .preload('address')
      .preload('status', (statusQuery) => {
        statusQuery.orderBy('updated_at', 'desc')
      })

    // Apply search filter
    if (search) {
      query.where((builder) => {
        builder
          .where('number', 'like', `%${search}%`)
          .orWhereHas('address', (addressBuilder) => {
            addressBuilder
              .where('name', 'like', `%${search}%`)
              .orWhere('phone', 'like', `%${search}%`)
              .orWhere('street', 'like', `%${search}%`)
          })
          .orWhereHas('status', (statusBuilder) => {
            statusBuilder.where('name', 'like', `%${search}%`)
          })
        if (statusCodesFromDisplay.length > 0) {
          builder.orWhereHas('status', (statusBuilder) => {
            statusBuilder.whereIn('name', statusCodesFromDisplay)
          })
        }
      })
    }

    if (status === 'active') {
      query.whereHas('status', (statusBuilder) => {
        statusBuilder
          .where('name', BookingStatuses.PICKUP_PROGRESS)
          .andWhereNot('name', BookingStatuses.DELIVERY)
          .andWhereNot('name', BookingStatuses.WAITING_DEPOSIT)
      })
    } else if (status === 'today') {
      query.whereHas('status', (statusBuilder) => {
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

  async shipMode({ inertia, params, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.isUser) {
      return response.redirect().toRoute('bookings.create')
    }

    const booking = await Booking.query()
      .where('number', params.id)
      .preload('address')
      .preload('status')
      .preload('photos')
      .preload('shoe')
      .first()
    if (!booking) {
      session.flash('general_errors', 'Booking tidak ditemukan.')
      return response.redirect().toRoute('staff.dashboard')
    }

    const existingPhoto = await BookingPhoto.query()
      .where('booking_id', booking.id)
      .where('stage', params.stage)
      .first()

    if (existingPhoto && !existingPhoto.path.startsWith('binding-')) {
      session.flash(
        'general_errors',
        'Tahap ini sudah selesai. Lepas tahap lain atau lanjut ke booking berikutnya.'
      )
      return response.redirect().toRoute('staff.dashboard')
    }

    if (existingPhoto && existingPhoto.adminId && existingPhoto.adminId !== user.id) {
      session.flash('general_errors', 'Tahap ini sudah diambil oleh staff lain.')
      return response.redirect().toRoute('staff.dashboard')
    }

    if (!existingPhoto) {
      await BookingPhoto.create({
        bookingId: booking.id,
        adminId: user.id,
        stage: params.stage,
        path: `binding-${params.stage}`, // placeholder until photo uploaded
        note: null,
      })
    } else {
      await existingPhoto.merge({ adminId: user.id, note: null }).save()
    }

    const stageStatusMap: Record<string, BookingStatuses> = {
      pickup: BookingStatuses.PICKUP_PROGRESS,
      check: BookingStatuses.INSPECTION,
      delivery: BookingStatuses.DELIVERY,
    }

    if (stageStatusMap[params.stage]) {
      // Only create status if not exists
      const existingStatus = await BookingStatus.query()
        .where('booking_id', booking.id)
        .where('name', stageStatusMap[params.stage])
        .first()
      if (!existingStatus) {
        await BookingStatus.create({ bookingId: booking.id, name: stageStatusMap[params.stage] })
      }
    }

    logger.info(`Staff ${user.id} melakukan ${params.stage} pada booking ${booking.id}`)

    return inertia.render('bookings/staff/ship-mode', {
      booking,
      stage: params.stage,
    })
  }

  async uploadShipPhoto({ inertia, response, request, session, params, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(uploadShipPhotoSchema)

    const booking = await Booking.query().where('number', params.id).first()
    if (!booking) {
      session.flash('general_errors', 'Booking tidak ditemukan.')
      return response.redirect().back()
    }

    const bookingPhoto = await BookingPhoto.query()
      .where('booking_id', booking.id)
      .where('stage', params.stage)
      .first()
    if (!bookingPhoto) {
      session.flash('general_errors', 'Tahap belum diambil.')
      return response.redirect().back()
    }

    if (bookingPhoto.adminId !== user.id) {
      session.flash('general_errors', 'Tahap ini diklaim oleh staff lain.')
      return response.redirect().back()
    }

    const stageConfig: Record<
      string,
      {
        status: BookingStatuses
        directory: string
      }
    > = {
      pickup: {
        status: BookingStatuses.INSPECTION, // next status after pickup photo
        directory: 'pickups',
      },
      check: {
        status: BookingStatuses.WAITING_PAYMENT,
        directory: 'inspections',
      },
      delivery: {
        status: BookingStatuses.COMPLETED,
        directory: 'deliveries',
      },
    }

    const config = stageConfig[params.stage]
    const fileName = `${booking.number}.${payload.image.extname}`
    const relativePath = `${config.directory}/${fileName}`

    await payload.image.moveToDisk(relativePath)

    await bookingPhoto
      .merge({
        path: relativePath,
        note: null,
      })
      .save()

    const existingStatus = await BookingStatus.query()
      .where('booking_id', booking.id)
      .where('name', config.status)
      .first()

    if (!existingStatus) {
      await BookingStatus.create({ bookingId: booking.id, name: config.status })
    }

    logger.info(`Staff ${user.id} mengunggah foto ${params.stage} pada booking ${booking.id}`)

    return inertia.render('bookings/staff/upload-ship-photo', {
      bookingId: booking.id,
      stage: params.stage,
      photoUrl: relativePath,
    })
  }

  async releaseShipMode({ inertia, session, response, params, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const payload = await request.validateUsing(releaseShipModeSchema)

    const bookingPhoto = await BookingPhoto.query()
      .where('booking_id', params.id)
      .where('stage', payload.stage)
      .first()

    if (!bookingPhoto) {
      session.flash('general_errors', 'Tahap belum diambil.')
      return response.redirect().back()
    }

    if (bookingPhoto.adminId !== user.id) {
      session.flash('general_errors', 'Anda tidak berhak melepas tahap ini.')
      return response.redirect().back()
    }

    // Remove photo record (stage becomes free again)
    await BookingPhoto.query().where('booking_id', params.id).where('stage', payload.stage).delete()

    // Remove related status only if matches stage entry (does not rollback progressed statuses beyond logic)
    const releaseStatusMap: Record<string, BookingStatuses> = {
      pickup: BookingStatuses.PICKUP_PROGRESS,
      check: BookingStatuses.INSPECTION,
      delivery: BookingStatuses.DELIVERY,
    }

    await BookingStatus.query()
      .where('booking_id', params.id)
      .where('name', releaseStatusMap[payload.stage])
      .delete()

    logger.info(`Staff ${user.id} melepas ${payload.stage} pada booking ${params.id}`)

    return inertia.render('bookings/staff/release-ship-mode')
  }
}
