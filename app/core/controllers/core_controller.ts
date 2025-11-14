import type { HttpContext } from '@adonisjs/core/http'

export default class CoreController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('core/home')
  }
}
