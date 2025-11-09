import { getUserDashboardRoute } from '#auth/utils/redirect'
import User from '#users/models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SocialController {
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async callback({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google')

    /**
     * User has denied access by canceling
     * the login flow
     */
    if (google.accessDenied()) {
      session.flash('google_errors', 'Akses ditolak. Silakan coba lagi.')

      return response.redirect().toRoute('register.show')
    }

    /**
     * OAuth state verification failed. This happens when the
     * CSRF cookie gets expired.
     */
    if (google.stateMisMatch()) {
      session.flash(
        'google_errors',
        'Verifikasi status OAuth gagal — kemungkinan cookie CSRF telah kedaluwarsa. Silakan coba lagi.'
      )

      return response.redirect().toRoute('register.show')
    }

    /**
     * Provider responded with some error
     */
    if (google.hasError()) {
      session.flash(
        'google_errors',
        'Terjadi kesalahan saat mengautentikasi dengan Google. Silakan coba lagi.'
      )

      return response.redirect().toRoute('register.show')
    }

    /**
     * Access user info
     */
    const socialUser = await google.user()

    let user = await User.findBy('email', socialUser.email)

    if (!user) {
      user = await User.create({
        fullName: socialUser.name,
        email: socialUser.email,
        password: null,
      })
    }

    await auth.use('web').login(user)

    const dashboardRoute = getUserDashboardRoute(user.roleId)
    return response.redirect().toRoute(dashboardRoute)
  }
}
