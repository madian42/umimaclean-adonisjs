import PasswordResetNotification from '#auth/mails/password_reset_mail'
import { forgotPasswordSchema } from '#auth/validators/auth_validator'
import ResetPasswordToken from '#users/models/reset_password_token'
import User from '#users/models/user'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'

export default class ForgotPasswordController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/forgot-password')
  }

  async handle({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(forgotPasswordSchema)

    const trx = await db.transaction()
    try {
      const user = await User.findBy('email', payload.email)
      if (user) {
        const token = await ResetPasswordToken.generateToken(user, trx)
        await mail.sendLater(new PasswordResetNotification(user, token.token))

        await trx.commit()
      }

      return response.redirect().back()
    } catch (error) {
      await trx.rollback()

      logger.error(`Error sending password reset email: ${error.message}`)
      session.flash('general_errors', 'Terjadi kesalahan saat mengirim email reset password')
      return response.redirect().back()
    }
  }
}
