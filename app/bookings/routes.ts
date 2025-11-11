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

router
  .group(() => {
    router.get('/booking', [BookingController, 'create']).as('bookings.create')
    router.post('/booking', [BookingController, 'store']).as('bookings.store')

    router.get('/bookings', [BookingController, 'index']).as('bookings.index')
    router.get('/bookings/:id', [BookingController, 'show']).as('bookings.show')
  })
  .use(middleware.auth())
