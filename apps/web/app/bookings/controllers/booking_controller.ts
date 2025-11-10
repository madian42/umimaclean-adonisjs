import Booking from '#bookings/models/booking'
import BookingStatus from '#bookings/models/booking_status'
import { bookingSchema } from '#bookings/validators/booking'
import BookingStatuses from '#core/enums/booking_status_enum'
import Address from '#users/models/address'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

export default class BookingController {
  async create({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    let addressId: string | null = null
    let role: string = 'staff'

    if (user.isUser) {
      const address = await Address.query().select('id').where('user_id', user.id).first()
      addressId = address?.id ?? null
      role = 'user'
    }

    return inertia.render(`bookings/${role}/create`, {
      addressId,
    })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(bookingSchema)

    const trx = await db.transaction()
    try {
      const booking = await Booking.create(
        {
          addressId: payload.addressId,
          date: payload.date,
          // time: payload.time, // in case needed later
          userId: user.id,
        },
        { client: trx }
      )

      await BookingStatus.create(
        {
          bookingId: booking.id,
          name: BookingStatuses.WAITING_DEPOSIT,
        },
        { client: trx }
      )

      await trx.commit()

      return response.redirect().toRoute('bookings.show', {
        id: booking.number,
      })
    } catch (error) {
      await trx.rollback()

      logger.error(`Error creating booking: ${error.message}`)
      session.flash('general_errors', 'Gagal membuat pemesanan')
      return response.redirect().back()
    }
  }

  async index({ request, auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()

    // Get query parameters
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const status = request.input('status', 'active') // 'completed', 'active'

    // Build the base query
    const query = Booking.query()
      .preload('address')
      .preload('status', (statusQuery) => {
        statusQuery.orderBy('updated_at', 'desc')
      })
      .where('user_id', user.id)

    // Apply search filter
    if (search) {
      query.where((builder) => {
        builder.where('number', 'like', `%${search}%`).orWhereHas('address', (addressBuilder) => {
          addressBuilder
            .where('name', 'like', `%${search}%`)
            .orWhere('phone', 'like', `%${search}%`)
            .orWhere('street', 'like', `%${search}%`)
        })
      })
    }
    const bookings = await query.orderBy('created_at', 'desc').paginate(page, limit)

    let role: string = 'staff'
    if (user.isUser) {
      role = 'user'
    }

    return inertia.render(`bookings/${role}/index`, {
      bookings: bookings.serialize(),
      filters: {
        search,
        status,
        page,
        limit,
      },
    })
  }

  async show({ params, inertia, auth, session, response }: HttpContext) {
    const bookingNumber = params.id
    const user = auth.getUserOrFail()

    const booking = await Booking.query()
      .preload('address')
      .preload('status')
      .where('number', bookingNumber)
      .where('user_id', user.id)
      .first()
    if (!booking) {
      session.flash('general_errors', 'Booking tidak ditemukan.')
      return response.redirect().toRoute('bookings.index')
    }

    let role: string = 'staff'
    if (user.isUser) {
      role = 'user'
    }

    return inertia.render(`bookings/${role}/show`, {
      booking,
    })
  }
}
