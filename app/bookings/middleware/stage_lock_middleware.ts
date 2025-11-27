import BookingAction from '#bookings/models/booking_action'
import Booking from '#bookings/models/booking'
import BookingActions from '#core/enums/booking_action_enum'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Middleware to prevent staff from navigating away while working on a stage
 *
 * Business Logic:
 * - Staff can only work on one stage at a time
 * - If staff has an active ATTEMPT_* action without completion, they're locked to that stage
 * - Staff must either complete (upload photo) or release the stage before navigating elsewhere
 * - Prevents context switching and ensures proper stage completion
 */
export default class StaffStageLockMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const user = ctx.auth.getUserOrFail()

    // Only apply to staff members
    if (!user || user.isUser) {
      return ctx.response.redirect().toPath('/')
    }

    // Check if staff has any active attempts (claimed but not completed stages)
    const activeAttempt = await BookingAction.query()
      .where('admin_id', user.id)
      .andWhereIn('action', [
        BookingActions.ATTEMPT_PICKUP,
        BookingActions.ATTEMPT_CHECK,
        BookingActions.ATTEMPT_DELIVERY,
      ])
      .whereDoesntHave('booking', (bookingQuery) => {
        // Exclude if the stage has been completed (has corresponding completion action)
        bookingQuery.whereHas('actions', (actionQuery) => {
          actionQuery
            .where('admin_id', user.id)
            .andWhereIn('action', [
              BookingActions.PICKUP,
              BookingActions.CHECK,
              BookingActions.DELIVERY,
            ])
        })
      })
      .whereDoesntHave('booking', (bookingQuery) => {
        // Exclude if the stage has been released
        bookingQuery.whereHas('actions', (actionQuery) => {
          actionQuery
            .where('admin_id', user.id)
            .andWhereIn('action', [
              BookingActions.RELEASE_PICKUP,
              BookingActions.RELEASE_CHECK,
              BookingActions.RELEASE_DELIVERY,
            ])
        })
      })
      .orderBy('created_at', 'desc')
      .first()

    if (activeAttempt) {
      const booking = await Booking.find(activeAttempt.bookingId)
      if (booking) {
        // Determine which stage is locked based on the attempt action
        const stageMap: Record<string, string> = {
          [BookingActions.ATTEMPT_PICKUP]: 'pickup',
          [BookingActions.ATTEMPT_CHECK]: 'check',
          [BookingActions.ATTEMPT_DELIVERY]: 'delivery',
        }

        const lockedStage = stageMap[activeAttempt.action]

        // Prevent navigation away from locked stage
        const requestedUrl = ctx.request.url()
        const lockBase = `/staff/bookings/ship/${lockedStage}/${booking.number}`

        // Allow only these URLs while locked:
        // 1. The stage page itself
        // 2. Photo upload endpoint
        // 3. Release endpoint
        const allowedUrls = [
          lockBase,
          `/staff/bookings/upload-ship-photo/${lockedStage}/${booking.number}`,
          `/staff/bookings/release-ship-mode`,
        ]

        const isAllowedUrl = allowedUrls.some((url) => requestedUrl.startsWith(url))

        if (!isAllowedUrl) {
          // Redirect back to locked stage with message
          ctx.session.flash(
            'general_errors',
            `Anda sedang mengerjakan tahap ${lockedStage} untuk booking ${booking.number}. Selesaikan atau lepas tahap ini terlebih dahulu.`
          )
          return ctx.response.redirect().toPath(lockBase)
        }
      }
    }

    await next()
  }
}
