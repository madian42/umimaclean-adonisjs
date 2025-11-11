import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#users/models/user'
import Roles from '#users/enums/role_enum'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        email: 'admin@repo.com',
        name: 'Administrador',
        password: 'wadaw123',
        roleId: Roles.ADMIN,
      },
      {
        email: 'staff@repo.com',
        name: 'Staff Member',
        password: 'wadaw123',
        roleId: Roles.STAFF,
      },
      {
        email: 'user@repo.com',
        name: 'Regular User',
        password: 'wadaw123',
        roleId: Roles.USER,
      },
    ])
  }
}
