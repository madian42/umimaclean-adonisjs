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

router.get('/login', [LoginController, 'show']).use(middleware.guest()).as('login.show')
router.post('/login', [LoginController]).as('login.handle')

router.get('/register', [RegisterController, 'show']).use(middleware.guest()).as('register.show')
router.post('/register', [RegisterController]).use(middleware.guest()).as('register.handle')

router
  .get('/forgot-password', [ForgotPasswordController, 'show'])
  .as('forgot_password.show')
  .use(middleware.guest())
router.post('/forgot-password', [ForgotPasswordController]).as('forgot_password.handle')

router
  .get('/reset-password/:token', [ResetPasswordController, 'show'])
  .use(middleware.guest())
  .as('reset_password.show')
router
  .post('/reset-password/:token', [ResetPasswordController])
  .use(middleware.guest())
  .as('reset_password.handle')

router.get('/auth/google/redirect', [SocialController, 'redirect']).as('social.show')
router.get('/auth/google/callback', [SocialController, 'callback']).as('social.callback')

router.post('/logout', [LogoutController]).as('logout.handle')
