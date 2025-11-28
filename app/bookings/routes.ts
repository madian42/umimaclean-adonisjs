/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const BookingController = () => import('#bookings/controllers/booking_controller')
const StaffBookingController = () => import('#bookings/controllers/staff_booking_controller')

router
  .group(() => {
    router.get('/booking', [BookingController, 'create']).as('bookings.create')
    router.post('/booking', [BookingController, 'store']).as('bookings.store')

    router.get('/bookings', [BookingController, 'index']).as('bookings.index')
    router.get('/bookings/:id', [BookingController, 'show']).as('bookings.show')

    router
      .group(() => {
        router.get('/dashboard', [StaffBookingController, 'index']).as('staff.dashboard')
        router
          .get('/staff/bookings/:id/inspection', [StaffBookingController, 'inspection'])
          .as('staff.bookings.inspection.show')

        router
          .get('/staff/bookings/ship/:stage/:id', [StaffBookingController, 'shipMode'])
          .as('staff.bookings.ship')
        router
          .post('/staff/bookings/ship/:stage/:id/upload-ship-photo', [
            StaffBookingController,
            'uploadShipPhoto',
          ])
          .as('staff.bookings.upload')
        router
          .post('/staff/bookings/ship/:stage/:id/release-ship-mode', [
            StaffBookingController,
            'releaseShipMode',
          ])
          .as('staff.bookings.release')
        router
          .post('/staff/bookings/:id/complete-inspection', [
            StaffBookingController,
            'completeInspection',
          ])
          .as('staff.bookings.inspection')
      })
      .use(middleware.staffStageLock())
  })
  .use(middleware.auth())
