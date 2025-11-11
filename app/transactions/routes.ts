/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const TransactionController = () => import('#transactions/controllers/transaction_controller')

router
  .group(() => {
    router
      .post('/transactions/create-dp/:id', [TransactionController, 'createDP'])
      .as('transactions.create_dp')
  })
  .use(middleware.auth())
