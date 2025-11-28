import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Address from '#users/models/address'
import { createUser, inertiaGet } from '#tests/utils/test_helpers'

test.group('User: profile page', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /profile renders users/profile for authenticated user (no accordion state)', async ({
    client,
  }) => {
    const user = await createUser()

    const response = await inertiaGet(client, '/profile', { loginAs: user })
    response.assertStatus(200)
    response.assertInertiaComponent('users/profile')
    response.assertInertiaPropsContains({ accordionState: undefined })
  })

  test('GET /profile?accordionState=change-password passes accordion state prop', async ({
    client,
  }) => {
    const user = await createUser()

    const response = await inertiaGet(client, '/profile?accordionState=change-password', {
      loginAs: user,
    })

    response.assertStatus(200)
    response.assertInertiaComponent('users/profile')
    response.assertInertiaPropsContains({ accordionState: 'change-password' })
  })
})

test.group('User: profile update name validation', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /profile fails with empty name', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/profile')
      .loginAs(user)
      .header('referer', '/profile')
      .form({ name: '' })
      .withCsrfToken()
      .withInertia()

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          name: 'Nama harus diisi',
        },
      },
    })
  })

  test('POST /profile fails with invalid name containing underscore', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/profile')
      .loginAs(user)
      .header('referer', '/profile')
      .form({ name: 'Invalid_Name' })
      .withCsrfToken()
      .withInertia()

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          name: 'Nama hanya boleh berisi huruf, spasi, dan tanda hubung',
        },
      },
    })
  })

  test('POST /profile succeeds updating name and redirects back', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/profile')
      .loginAs(user)
      .header('referer', '/profile')
      .form({ name: 'Nama Valid' })
      .withCsrfToken()
      .withInertia()

    response.assertRedirectsTo('/profile')
  })
})

test.group('User: profile change password validation', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /profile/change-password fails with wrong current_password', async ({ client }) => {
    const user = await createUser({ password: 'oldpass123' })

    const response = await client
      .post('/profile/change-password')
      .loginAs(user)
      .header('referer', '/profile?accordionState=change-password')
      .form({
        current_password: 'incorrect123',
        password: 'newpass123',
        password_confirmation: 'newpass123',
      })
      .withCsrfToken()
      .withInertia()

    response.assertRedirectsTo('/profile?accordionState=change-password')
    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          current_password: 'Kata sandi saat ini salah',
        },
      },
    })
  })

  test('POST /profile/change-password fails with password too short', async ({ client }) => {
    const user = await createUser({ password: 'oldpass123' })

    const response = await client
      .post('/profile/change-password')
      .loginAs(user)
      .header('referer', '/profile?accordionState=change-password')
      .form({
        current_password: 'oldpass123',
        password: 'short',
        password_confirmation: 'short',
      })
      .withCsrfToken()
      .withInertia()

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          password: 'Kata sandi harus memiliki minimal 8 karakter',
        },
      },
    })
  })

  test('POST /profile/change-password fails with password underscore invalid regex', async ({
    client,
  }) => {
    const user = await createUser({ password: 'oldpass123' })

    const response = await client
      .post('/profile/change-password')
      .loginAs(user)
      .header('referer', '/profile?accordionState=change-password')
      .form({
        current_password: 'oldpass123',
        password: 'new_pass1', // underscore not allowed
        password_confirmation: 'new_pass1',
      })
      .withCsrfToken()
      .withInertia()

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          password:
            'Kata sandi harus memiliki minimal 8 karakter, termasuk huruf besar, huruf kecil, dan angka',
        },
      },
    })
  })

  test('POST /profile/change-password fails with password confirmation mismatch', async ({
    client,
  }) => {
    const user = await createUser({ password: 'oldpass123' })

    const response = await client
      .post('/profile/change-password')
      .loginAs(user)
      .header('referer', '/profile?accordionState=change-password')
      .form({
        current_password: 'oldpass123',
        password: 'newpass123',
        password_confirmation: 'another123',
      })
      .withCsrfToken()
      .withInertia()

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          password_confirmation: 'Konfirmasi kata sandi harus sama dengan kata sandi',
        },
      },
    })
  })

  test('POST /profile/change-password succeeds and redirects back', async ({ client }) => {
    const user = await createUser({ password: 'oldpass123' })

    const response = await client
      .post('/profile/change-password')
      .loginAs(user)
      .header('referer', '/profile?accordionState=change-password')
      .form({
        current_password: 'oldpass123',
        password: 'newpass123',
        password_confirmation: 'newpass123',
      })
      .withCsrfToken()
      .withInertia()

    response.assertRedirectsTo('/profile?accordionState=change-password')
  })
})

test.group('User: address page', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /address renders users/address with null when address absent', async ({ client }) => {
    const user = await createUser()
    const response = await client.get('/address').loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('users/address')
    response.assertInertiaPropsContains({ address: null })
  })

  test('GET /address renders users/address with existing address', async ({ client }) => {
    const user = await createUser()
    const address = await Address.create({
      userId: user.id,
      name: 'John',
      phone: '0812345678',
      street: 'Main Street',
      latitude: 0,
      longitude: 0,
      radius: 10,
      note: null,
    })

    const response = await client.get('/address').loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('users/address')
    response.assertInertiaPropsContains({ address: { id: address.id } })
  })
})

test.group('User: address validation', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /address fails with invalid phone characters', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/address')
      .loginAs(user)
      .header('referer', '/address')
      .form({
        name: 'John',
        phone: 'phoneX123',
        street: 'Street',
        latitude: 0,
        longitude: 0,
        radius: 10,
        note: '',
      })
      .withCsrfToken()
      .withInertia()

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          phone: 'Nomor telepon hanya boleh berisi angka',
        },
      },
    })
  })

  test('POST /address fails with radius too large', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/address')
      .loginAs(user)
      .header('referer', '/address')
      .form({
        name: 'John',
        phone: '0812345678',
        street: 'Street',
        latitude: 0,
        longitude: 0,
        radius: 50000,
        note: '',
      })
      .withCsrfToken()
      .withInertia()

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          radius: 'Radius harus maksimal 40000',
        },
      },
    })
  })

  test('POST /address fails with invalid name underscore', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/address')
      .loginAs(user)
      .header('referer', '/address')
      .form({
        name: 'Invalid_Name',
        phone: '0812345678',
        street: 'Street',
        latitude: 0,
        longitude: 0,
        radius: 10,
        note: '',
      })
      .withCsrfToken()
      .withInertia()

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          name: 'Nama hanya boleh berisi huruf, spasi, dan tanda hubung',
        },
      },
    })
  })

  test('POST /address succeeds creating or updating address and redirects back', async ({
    client,
  }) => {
    const user = await createUser()

    const response = await client
      .post('/address')
      .loginAs(user)
      .header('referer', '/address')
      .form({
        name: 'John',
        phone: '0812345678',
        street: 'Street',
        latitude: 0,
        longitude: 0,
        radius: 10,
        note: '',
      })
      .withCsrfToken()
      .withInertia()

    response.assertRedirectsTo('/address')
  })
})
