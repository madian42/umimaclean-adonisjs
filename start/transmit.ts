import transmit from '@adonisjs/transmit/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import Booking from '#bookings/models/booking'

transmit.authorize<{ id: string }>('payments/:id/dp', async (ctx: HttpContext, { id }) => {
  const booking = await Booking.query().where('number', id).preload('transaction').first()

  return ctx.auth.user?.id === booking?.userId
})
