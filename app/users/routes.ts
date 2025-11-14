/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const ProfileController = () => import('#users/controllers/profile_controller')
const AddressController = () => import('#users/controllers/address_controller')
const StaffProfileController = () => import('#users/controllers/staff_profile_controller')

router
  .group(() => {
    router.get('/profile', [ProfileController, 'index']).as('profile.show')
    router.post('/profile', [ProfileController, 'updateName']).as('profile.update')
    router
      .post('/profile/change-password', [ProfileController, 'updatePassword'])
      .as('profile.change_password.handle')

    router.get('/profile/address', [AddressController, 'index']).as('profile.address')
    router.put('/profile/address', [AddressController, 'store']).as('profile.address.handle')

    router.get('/staff/profile', [StaffProfileController, 'index']).as('staff.profile.show')
  })
  .use(middleware.auth())
