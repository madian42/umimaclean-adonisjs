import { test } from '@japa/runner'
import User from '#users/models/user'
import Roles from '#users/enums/role_enum'
import Address from '#users/models/address'
import Booking from '#bookings/models/booking'
import BookingAction from '#bookings/models/booking_action'
import BookingPhoto from '#bookings/models/booking_photo'
import BookingActions from '#core/enums/booking_action_enum'

test.group('Staff: dashboard and ship mode', () => {
  test('GET /dashboard renders staff dashboard for staff', async ({ client }) => {
    const staff = await User.create({
      email: 'staff-dash@example.com',
      name: 'Staff',
      password: 'secret123',
      roleId: Roles.STAFF,
    })

    const response = await client.get('/dashboard').loginAs(staff).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('bookings/staff/index')
  })

  test('GET /dashboard redirects normal users to /booking', async ({ client, assert }) => {
    const user = await User.create({
      email: 'user-dash-redirect@example.com',
      name: 'User',
      password: 'secret123',
      roleId: Roles.USER,
    })

    const response = await client.get('/dashboard').loginAs(user)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/booking')
  })

  test('GET /staff/bookings/ship/pickup/:number allows staff to claim and renders ship-mode', async ({
    client,
  }) => {
    const staff = await User.create({
      email: 'staff-pickup@example.com',
      name: 'Staff',
      password: 'secret123',
      roleId: Roles.STAFF,
    })
    const customer = await User.create({
      email: 'customer-pickup@example.com',
      name: 'Cust',
      password: 'secret123',
      roleId: Roles.USER,
    })
    const address = await Address.create({
      userId: customer.id,
      name: 'John',
      phone: '62811',
      street: 'Street',
      latitude: 0,
      longitude: 0,
      radius: 0,
      note: null,
    })
    const booking = await Booking.create({
      userId: customer.id,
      addressId: address.id,
      date: new Date(),
    })

    const response = await client
      .get(`/staff/bookings/ship/pickup/${booking.number}`)
      .loginAs(staff)
      .withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('bookings/staff/ship-mode')
    response.assertInertiaPropsContains({ stage: 'pickup' })
  })

  test('GET /staff/bookings/ship/check/:number redirects to complete-inspection POST path (route mismatch present)', async ({
    client,
    assert,
  }) => {
    const staff = await User.create({
      email: 'staff-check@example.com',
      name: 'Staff',
      password: 'secret123',
      roleId: Roles.STAFF,
    })
    const customer = await User.create({
      email: 'customer-check@example.com',
      name: 'Cust',
      password: 'secret123',
      roleId: Roles.USER,
    })
    const booking = await Booking.create({
      userId: customer.id,
      addressId: null,
      date: new Date(),
    })

    const response = await client.get(`/staff/bookings/ship/check/${booking.number}`).loginAs(staff)

    response.assertStatus(302)
    // Current code redirects to route name 'staff.bookings.inspection' -> '/staff/bookings/:id/complete-inspection'
    // for GET - which likely 404s if followed. The redirect target should be a dedicated GET inspection route.
    assert.include(response.header('location'), `/staff/bookings/${booking.id}/complete-inspection`)
  })

  test('GET /staff/bookings/ship/pickup/:number returns redirect when already completed (photo exists)', async ({
    client,
    assert,
  }) => {
    const staff = await User.create({
      email: 'staff-photo@example.com',
      name: 'Staff',
      password: 'secret123',
      roleId: Roles.STAFF,
    })
    const customer = await User.create({
      email: 'customer-photo@example.com',
      name: 'Cust',
      password: 'secret123',
      roleId: Roles.USER,
    })
    const booking = await Booking.create({
      userId: customer.id,
      addressId: null,
      date: new Date(),
    })
    await BookingPhoto.create({
      bookingId: booking.id,
      adminId: staff.id,
      stage: 'pickup',
      path: 'pickups/x.jpg',
      note: null,
    })

    const response = await client
      .get(`/staff/bookings/ship/pickup/${booking.number}`)
      .loginAs(staff)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
  })

  test('GET /staff/bookings/ship/pickup/:number redirects when claimed by other staff', async ({
    client,
    assert,
  }) => {
    const staff1 = await User.create({
      email: 'staff-one@example.com',
      name: 'Staff One',
      password: 'secret123',
      roleId: Roles.STAFF,
    })
    const staff2 = await User.create({
      email: 'staff-two@example.com',
      name: 'Staff Two',
      password: 'secret123',
      roleId: Roles.STAFF,
    })
    const customer = await User.create({
      email: 'customer-claimed@example.com',
      name: 'Cust',
      password: 'secret123',
      roleId: Roles.USER,
    })
    const booking = await Booking.create({
      userId: customer.id,
      addressId: null,
      date: new Date(),
    })
    await BookingAction.create({
      bookingId: booking.id,
      bookingPhotoId: null,
      adminId: staff1.id,
      action: BookingActions.ATTEMPT_PICKUP,
      note: null,
    })

    const response = await client
      .get(`/staff/bookings/ship/pickup/${booking.number}`)
      .loginAs(staff2)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
  })
})
