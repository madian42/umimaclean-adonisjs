import { resetPasswordSchema } from '#auth/validators/auth_validator'
import ResetPasswordToken from '#users/models/reset_password_token'
import User from '#users/models/user'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

export default class ResetPasswordController {
  async show({ inertia, params }: HttpContext) {
    const token = await ResetPasswordToken.getToken(params.token)
    if (!token) {
      return inertia.render('core/errors/invalid-token')
    }

    return inertia.render('auth/reset-password')
  }

  async handle({ request, params, session, inertia, response }: HttpContext) {
    const token = await ResetPasswordToken.getToken(params.token)
    if (!token) {
      return inertia.render('core/errors/invalid-token')
    }

    const payload = await request.validateUsing(resetPasswordSchema)
    const user = await User.findOrFail(token.userId)

    const trx = await db.transaction()
    try {
      await user.useTransaction(trx).merge({ password: payload.password }).save()
      await ResetPasswordToken.deleteTokens(user, trx)

      await trx.commit()

      return response.redirect().toRoute('login')
    } catch (error) {
      await trx.rollback()

      logger.error(`Error resetting password: ${error.message}`)
      session.flash('general_errors', 'Terjadi kesalahan saat mereset password.')
      return response.redirect().toPath(`/reset-password?token=${token}`)
    }
  }
}
