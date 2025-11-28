import { test } from '@japa/runner'
import Booking from '#bookings/models/booking'
import testUtils from '@adonisjs/core/services/test_utils'
import {
  createUser,
  createAddressFor,
  createBookingFor,
  inertiaGet,
  inertiaPost,
} from '../utils/test_helpers.js'

test.group('Bookings (user): GET pages and flows', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /booking renders bookings/user/create with addressId prop', async ({ client }) => {
    const user = await createUser()
    const address = await createAddressFor(user.id)

    const response = await inertiaGet(client, '/booking', { loginAs: user })
    response.assertStatus(200)
    response.assertInertiaComponent('bookings/user/create')
    response.assertInertiaPropsContains({ addressId: address.id })
  })

  test('POST /booking creates booking and redirects to bookings.show', async ({ client }) => {
    const user = await createUser()
    const address = await createAddressFor(user.id)

    const response = await inertiaPost(
      client,
      '/booking',
      {
        addressId: address.id,
        date: '2025-01-01',
      },
      {
        loginAs: user,
        referer: '/booking',
      }
    )

    const created = await Booking.query().where('user_id', user.id).first()
    response.assertRedirectsTo(`/bookings/${created!.number}`)
  })

  test('GET /bookings renders bookings/user/index', async ({ client }) => {
    const user = await createUser()
    const address = await createAddressFor(user.id)
    await createBookingFor(user.id, { addressId: address.id })

    const response = await inertiaGet(client, '/bookings', { loginAs: user })
    response.assertStatus(200)
    response.assertInertiaComponent('bookings/user/index')
  })

  test('GET /bookings/:id renders bookings/user/show for owned booking', async ({ client }) => {
    const user = await createUser()
    const address = await createAddressFor(user.id)
    const booking = await createBookingFor(user.id, { addressId: address.id })

    const response = await inertiaGet(client, `/bookings/${booking.number}`, { loginAs: user })
    response.assertStatus(200)
    response.assertInertiaComponent('bookings/user/show')
  })

  test('GET /bookings/:id redirects to /bookings when not found or not owned', async ({
    client,
  }) => {
    const user = await createUser()

    const response = await inertiaGet(client, `/bookings/ORD0000`, { loginAs: user })
    response.assertRedirectsTo('/bookings')
  })
})

test.group('Bookings (user): validation', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /booking fails when addressId is missing', async ({ client }) => {
    const user = await createUser()

    const response = await inertiaPost(
      client,
      '/booking',
      {
        // addressId is missing
        date: '2025-01-01',
      },
      {
        loginAs: user,
        referer: '/booking',
      }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { addressId: 'ID Alamat harus diisi' } },
    })
  })

  test('POST /booking fails when addressId is not a valid UUID', async ({ client }) => {
    const user = await createUser()

    const response = await inertiaPost(
      client,
      '/booking',
      {
        addressId: 'not-a-uuid',
        date: '2025-01-01',
      },
      {
        loginAs: user,
        referer: '/booking',
      }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { addressId: 'ID Alamat harus berupa UUID yang valid' } },
    })
  })

  test('POST /booking fails when date is missing', async ({ client }) => {
    const user = await createUser()
    const address = await createAddressFor(user.id)

    const response = await inertiaPost(
      client,
      '/booking',
      {
        addressId: address.id,
        // date is missing
      },
      {
        loginAs: user,
        referer: '/booking',
      }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { date: 'Tanggal harus diisi' } },
    })
  })

  test('POST /booking fails when date is not a string', async ({ client }) => {
    const user = await createUser()
    const address = await createAddressFor(user.id)

    const response = await inertiaPost(
      client,
      '/booking',
      {
        addressId: address.id,
        date: 'not-a-date',
      },
      {
        loginAs: user,
        referer: '/booking',
      }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { date: 'Tanggal harus berupa teks' } },
    })
  })
})
