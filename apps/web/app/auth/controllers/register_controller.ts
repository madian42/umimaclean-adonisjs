import { registerValidator } from '#auth/validators/rule'
import User from '#users/models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  async handle({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    const user = await User.create(payload)

    await auth.use('web').login(user)

    return response.redirect().toRoute('dashboard')
  }
}
