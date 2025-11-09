import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#users/models/user'
import Roles from '#users/enums/role'

export default class UserSeeder extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        email: 'admin@repo.com',
        fullName: 'Administrador',
        password: 'wadaw123',
        roleId: Roles.ADMIN,
      },
      {
        email: 'staff@repo.com',
        fullName: 'Staff Member',
        password: 'wadaw123',
        roleId: Roles.STAFF,
      },
      {
        email: 'user@repo.com',
        fullName: 'Regular User',
        password: 'wadaw123',
        roleId: Roles.USER,
      },
    ])
  }
}
