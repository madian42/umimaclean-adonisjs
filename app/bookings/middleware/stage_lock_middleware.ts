import BookingPhoto from '#bookings/models/booking_photo'
import Booking from '#bookings/models/booking'
import type { HttpContext } from '@adonisjs/core/http'

export default class StaffStageLockMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const user = ctx.auth.getUserOrFail()
    if (!user || user.isUser) {
      return next()
    }

    const inProgress = await BookingPhoto.query()
      .where('admin_id', user.id)
      .whereLike('path', 'binding-%')
      .orderBy('updated_at', 'desc')
      .first()

    if (inProgress) {
      const booking = await Booking.find(inProgress.bookingId)
      if (booking) {
        // Prevent leaving until finished or released
        const requestedUrl = ctx.request.url()
        const lockBase = `/staff/bookings/ship/${inProgress.stage}/${booking.number}`
        if (
          !requestedUrl.startsWith(lockBase) &&
          !requestedUrl.includes('/upload-ship-photo') &&
          !requestedUrl.includes('/release-ship-mode')
        ) {
          return ctx.response.redirect().toPath(lockBase)
        }
      }
    }

    await next()
  }
}
