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
const CoreController = () => import('#core/controllers/core_controller')
const HealthChecksController = () => import('#core/controllers/health_checks_controller')

router.get('/', [CoreController]).as('home').use(middleware.guest())
router.get('/health', [HealthChecksController]).as('health').use(middleware.guest())
