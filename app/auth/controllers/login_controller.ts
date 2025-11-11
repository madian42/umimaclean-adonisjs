import User from '#users/models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { getUserDashboardRoute } from '#auth/utils/redirect_login'
import limiter from '@adonisjs/limiter/services/main'
import { loginSchema } from '#auth/validators/auth_validator'
import logger from '@adonisjs/core/services/logger'

export default class LoginController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  async handle({ request, auth, session, response }: HttpContext) {
    const payload = await request.validateUsing(loginSchema)

    const key = `login_${request.ip()}_${payload.email}`
    const loginLimiter = limiter.use({
      requests: 5,
      duration: '1 min',
      blockDuration: '2 min',
    })

    const [errors, user] = await loginLimiter.penalize(key, () => {
      return User.verifyCredentials(payload.email, payload.password)
    })
    if (errors) {
      logger.info(`Login failed for email: ${payload.email} from IP: ${request.ip()}`)
      session.flash('limiter_errors', 'Terlalu banyak percobaan login. Silakan coba lagi nanti.')
      return response.redirect().toRoute('login.show')
    }

    await auth.use('web').login(user, !!payload.remember_me)

    const dashboardRoute = getUserDashboardRoute(user.roleId)
    return response.redirect().toRoute(dashboardRoute)
  }
}
