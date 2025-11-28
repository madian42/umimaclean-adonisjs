import { test } from '@japa/runner'
import User from '#users/models/user'
import Roles from '#users/enums/role_enum'
import Booking from '#bookings/models/booking'
import Transaction from '#transactions/models/transaction'
import TransactionStatuses from '#core/enums/transaction_status_enum'

test.group('Transactions: payment page', () => {
  test('GET /transactions/:bookingNumber renders transactions/payment with latest transaction', async ({
    client,
  }) => {
    const user = await User.create({
      email: 'txn-user@example.com',
      name: 'Txn User',
      password: 'secret123',
      roleId: Roles.USER,
    })
    const booking = await Booking.create({
      userId: user.id,
      addressId: null,
      date: new Date(),
    })
    await Transaction.create({
      bookingId: booking.id,
      amount: 12345,
      status: TransactionStatuses.PENDING,
      type: 'down_payment',
      midtransStatus: TransactionStatuses.PENDING,
      midtransId: 'dummy-midtrans-id',
    })

    const response = await client.get(`/transactions/${booking.number}`).loginAs(user).withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('transactions/payment')
  })
})
