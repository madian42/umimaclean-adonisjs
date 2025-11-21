/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { throttle } from '#start/limiter'
import router from '@adonisjs/core/services/router'
const CoreController = () => import('#core/controllers/core_controller')
const HealthChecksController = () => import('#core/controllers/health_checks_controller')
import transmit from '@adonisjs/transmit/services/main'

router.get('/', [CoreController]).as('home').use(middleware.guest())
router.get('/health', [HealthChecksController]).as('health').use(middleware.guest())
transmit.registerRoutes((route) => {
  // Ensure you are authenticated to register your client
  if (route.getPattern() === '__transmit/events') {
    route.middleware(middleware.auth())
    return
  }

  // Add a throttle middleware to other transmit routes
  route.use(throttle)
})
