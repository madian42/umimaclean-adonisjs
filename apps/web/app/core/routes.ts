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
const HomeController = () => import('#core/controllers/home_controller')
const HealthChecksController = () => import('#core/controllers/health_checks_controller')

router.get('/', [HomeController]).use(middleware.guest())
router.get('/health', [HealthChecksController]).use(middleware.guest())
