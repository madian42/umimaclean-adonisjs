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

const LoginController = () => import('#auth/controllers/login_controller')
const LogoutController = () => import('#auth/controllers/logout_controller')
const RegisterController = () => import('#auth/controllers/register_controller')
const ForgotPasswordController = () => import('#auth/controllers/forgot_password_controller')
const ResetPasswordController = () => import('#auth/controllers/reset_password_controller')
const SocialController = () => import('#auth/controllers/social_controller')

router
  .group(() => {
    router.get('/login', [LoginController, 'show']).as('login.show')
    router.post('/login', [LoginController]).as('login.handle')

    router.get('/register', [RegisterController, 'show']).as('register.show')
    router.post('/register', [RegisterController]).as('register.handle')

    router.get('/forgot-password', [ForgotPasswordController, 'show']).as('forgot_password.show')
    router.post('/forgot-password', [ForgotPasswordController]).as('forgot_password.handle')

    router
      .get('/reset-password/:token', [ResetPasswordController, 'show'])
      .as('reset_password.show')
    router.post('/reset-password/:token', [ResetPasswordController]).as('reset_password.handle')

    router.get('/auth/google/redirect', [SocialController, 'redirect']).as('social.show')
    router.get('/auth/google/callback', [SocialController, 'callback']).as('social.callback')
  })
  .use(middleware.guest())

router.post('/logout', [LogoutController]).as('logout.handle').use(middleware.auth())
