import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import ResetPasswordToken from '#users/models/reset_password_token'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUser, inertiaPost } from '#tests/utils/test_helpers'

test.group('Auth: GET pages', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /login returns auth/login for guests', async ({ client }) => {
    const response = await client.get('/login').withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('auth/login')
  })

  test('GET /register returns auth/register for guests', async ({ client }) => {
    const response = await client.get('/register').withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('auth/register')
  })

  test('GET /forgot-password returns auth/forgot-password for guests', async ({ client }) => {
    const response = await client.get('/forgot-password').withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('auth/forgot-password')
  })

  test('GET /login redirects to /booking when already logged in', async ({ client }) => {
    const user = await createUser()

    const response = await client.get('/login').loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('bookings/user/create')
  })

  test('GET /register redirects to /booking when already logged in', async ({ client }) => {
    const user = await createUser()

    const response = await client.get('/login').loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('bookings/user/create')
  })

  test('GET /forgot-password redirects to /booking when already logged in', async ({ client }) => {
    const user = await createUser()

    const response = await client.get('/forgot-password').loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('bookings/user/create')
  })

  test('GET /reset-password/:token redirects to /booking when already logged in', async ({
    client,
  }) => {
    const user = await createUser()

    const response = await client.get('/reset-password/:token').loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('bookings/user/create')
  })
})

test.group('Auth: validation', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /register fails with invalid email', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/register',
      {
        email: 'invalid-email',
        name: 'Valid Name',
        password: 'secret123',
        password_confirmation: 'secret123',
      },
      { referer: '/register' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: { email: 'Alamat email harus berupa alamat email yang valid' },
      },
    })
  })

  test('POST /register fails with invalid password too short', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/register',
      {
        email: 'valid@email.com',
        name: 'Valid Name',
        password: 'short',
        password_confirmation: 'short',
      },
      { referer: '/register' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: { password: 'Kata sandi harus memiliki minimal 8 karakter' },
      },
    })
  })

  test('POST /register fails with invalid password too long', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/register',
      {
        email: 'valid@email.com',
        name: 'Valid Name',
        password: 'veryverylongpassword12',
        password_confirmation: 'veryverylongpassword12',
      },
      { referer: '/register' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: { password: 'Kata sandi harus memiliki maksimal 16 karakter' },
      },
    })
  })

  test('POST /register fails with invalid password format', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/register',
      {
        email: 'valid@email.com',
        name: 'Valid Name',
        password: 'invalid-password',
        password_confirmation: 'invalid-password',
      },
      { referer: '/register' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          password: 'Kata sandi harus memiliki 8-16 karakter dan berisi huruf serta angka',
        },
      },
    })
  })

  test('POST /register fails with invalid password mismatch', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/register',
      {
        email: 'valid@email.com',
        name: 'Valid Name',
        password: 'invalid123',
        password_confirmation: 'invalid321',
      },
      { referer: '/register' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          password: 'Kata sandi tidak cocok',
        },
      },
    })
  })

  test('POST /register fails with invalid name format', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/register',
      {
        email: 'valid@email.com',
        name: 'Invalid_Name',
        password: 'secret123',
        password_confirmation: 'secret123',
      },
      { referer: '/register' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: { name: 'Nama hanya boleh berisi huruf, spasi, dan tanda hubung' },
      },
    })
  })

  test('POST /register fails when email already exists', async ({ client }) => {
    const user = await createUser()

    const response = await inertiaPost(
      client,
      '/register',
      {
        email: user.email,
        name: 'Valid Name',
        password: 'secret123',
        password_confirmation: 'secret123',
      },
      { referer: '/register' }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { email: 'Alamat email sudah terdaftar' } },
    })
  })

  test('POST /login fails with invalid email', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/login',
      {
        email: 'invalid-email',
        password: 'secret123',
        remember_me: false,
      },
      { referer: '/login' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          email: 'Alamat email harus berupa alamat email yang valid',
        },
      },
    })
  })

  test('POST /login fails with password too short', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/login',
      {
        email: 'valid-login@example.com',
        password: 'short',
        remember_me: false,
      },
      { referer: '/login' }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { password: 'Kata sandi harus memiliki minimal 8 karakter' } },
    })
  })

  test('POST /login fails with password too long', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/login',
      {
        email: 'valid-login@example.com',
        password: 'averyveryverylongpw', // > 16 chars
        remember_me: false,
      },
      { referer: '/login' }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { password: 'Kata sandi harus memiliki maksimal 16 karakter' } },
    })
  })

  test('POST /login fails with invalid password format', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/login',
      {
        email: 'valid-login@example.com',
        password: 'onlyletters', // 11 chars, no digit
        remember_me: false,
      },
      { referer: '/login' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          password: 'Kata sandi harus memiliki 8-16 karakter dan berisi huruf serta angka',
        },
      },
    })
  })

  test('POST /login fails when remember_me is not boolean', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/login',
      {
        email: 'valid-login@example.com',
        password: 'secret123',
        remember_me: 'yes', // invalid type for boolean
      },
      { referer: '/login' }
    )

    // Field map doesn't define 'remember_me', so the field name shows as-is
    response.assertInertiaPropsContains({
      errors: {
        validation_errors: { remember_me: 'remember_me harus berupa nilai benar atau salah' },
      },
    })
  })

  test('POST /login fails when credentials not match', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/login',
      {
        email: 'valid-login@example.com',
        password: 'random321',
      },
      { referer: '/login' }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          email: 'Nomor telepon atau kata sandi salah.',
          password: 'Nomor telepon atau kata sandi salah.',
        },
      },
    })
  })

  test('POST /forgot-password fails with invalid email', async ({ client }) => {
    const response = await inertiaPost(
      client,
      '/forgot-password',
      {
        email: 'not-an-email',
      },
      { referer: '/forgot-password' }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { email: 'Alamat email harus berupa alamat email yang valid' } },
    })
  })

  test('POST /reset-password/:token fails with password too short', async ({ client }) => {
    const user = await createUser()
    const trx = await db.transaction()
    const token = await ResetPasswordToken.generateToken(user, trx)
    await trx.commit()

    const response = await inertiaPost(
      client,
      `/reset-password/${token.token}`,
      {
        password: 'short',
        password_confirmation: 'short',
      },
      {
        referer: `/reset-password/${token.token}`,
      }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { password: 'Kata sandi harus memiliki minimal 8 karakter' } },
    })
  })

  test('POST /reset-password/:token fails with password too long', async ({ client }) => {
    const user = await createUser()
    const trx = await db.transaction()
    const token = await ResetPasswordToken.generateToken(user, trx)
    await trx.commit()

    const response = await inertiaPost(
      client,
      `/reset-password/${token.token}`,
      {
        password: 'veryverylongpassword12',
        password_confirmation: 'veryverylongpassword12',
      },
      {
        referer: `/reset-password/${token.token}`,
      }
    )

    response.assertInertiaPropsContains({
      errors: { validation_errors: { password: 'Kata sandi harus memiliki maksimal 16 karakter' } },
    })
  })

  test('POST /reset-password/:token fails with invalid password format', async ({ client }) => {
    const user = await createUser()
    const trx = await db.transaction()
    const token = await ResetPasswordToken.generateToken(user, trx)
    await trx.commit()

    const response = await inertiaPost(
      client,
      `/reset-password/${token.token}`,
      {
        password: 'onlyletters',
        password_confirmation: 'onlyletters',
      },
      {
        referer: `/reset-password/${token.token}`,
      }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          password: 'Kata sandi harus memiliki 8-16 karakter dan berisi huruf serta angka',
        },
      },
    })
  })

  test('POST /reset-password/:token fails with password_confirmation mismatch', async ({
    client,
  }) => {
    const user = await createUser()
    const trx = await db.transaction()
    const token = await ResetPasswordToken.generateToken(user, trx)
    await trx.commit()

    const response = await inertiaPost(
      client,
      `/reset-password/${token.token}`,
      {
        password: 'valid123',
        password_confirmation: 'invalid321',
      },
      {
        referer: `/reset-password/${token.token}`,
      }
    )

    response.assertInertiaPropsContains({
      errors: {
        validation_errors: {
          password_confirmation: 'Konfirmasi kata sandi harus sama dengan kata sandi',
        },
      },
    })
  })
})

test.group('Auth: login/logout', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /login succeeds and redirects to user dashboard', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/login')
      .header('referer', '/login')
      .form({
        email: user.email,
        password: 'secret123',
        remember_me: false,
      })
      .withCsrfToken()
      .withInertia()

    response.assertRedirectsTo('/booking')
  })

  test('POST /login fails with wrong credentials and redirects to /login', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/login')
      .header('referer', '/login')
      .form({
        email: user.email,
        password: 'not-correct',
      })
      .withCsrfToken()
      .withInertia()

    response.assertRedirectsTo('/login')
  })

  test('POST /logout logs out and redirects to home', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .post('/logout')
      .header('referer', '/booking')
      .loginAs(user)
      .withCsrfToken()
      .withInertia()

    response.assertRedirectsTo('/')
  })
})

test.group('Auth: reset password', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('GET /reset-password/:token returns invalid-token component when token invalid', async ({
    client,
  }) => {
    const response = await client.get('/reset-password/some-invalid-token').withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('core/errors/invalid-token')
  })

  test('GET /reset-password/:token returns reset page when token valid', async ({ client }) => {
    const user = await createUser()

    const trx = await db.transaction()
    const token = await ResetPasswordToken.generateToken(user, trx)
    await trx.commit()

    const response = await client.get(`/reset-password/${token.token}`).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('auth/reset-password')
  })
})
