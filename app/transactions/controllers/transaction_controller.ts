import Booking from '#bookings/models/booking'
import TransactionStatuses from '#core/enums/transaction_status_enum'
import env from '#start/env'
import Transaction from '#transactions/models/transaction'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { errors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import { DateTime } from 'luxon'
import {
  FetchOptions,
  MidtransChargeBody,
  MidtransResponse,
  TransactionCreatePayload,
  CreateTransactionFlow,
  MidtransNotification,
} from '#transactions/types/index'
import { createHash } from 'node:crypto'
import BookingStatus from '#bookings/models/booking_status'
import BookingStatuses from '#core/enums/booking_status_enum'
import transmit from '@adonisjs/transmit/services/main'

export default class TransactionController {
  async createDP({ request, params, response, session }: HttpContext) {
    const booking = await Booking.query().where('id', params.id).preload('address').first()
    if (!booking) {
      session.flash('general_errors', 'Booking tidak ditemukan')
      return response.redirect().back()
    }

    const amount = this.computeDpAmount(booking)

    return this.createPaymentFlow({
      ctx: { request, params, response, session } as HttpContext,
      booking,
      amount,
      orderPrefix: 'DP',
      customField: 'down_payment',
      midtransFieldKey: 'midtransDownPaymentId',
      transactionField: 'downPayment',
    })
  }

  async createFull({ request, params, response, session }: HttpContext) {
    const amount = request.input('amount') as number

    const booking = await Booking.query().where('id', params.id).preload('address').first()
    if (!booking) {
      session.flash('general_errors', 'Booking tidak ditemukan')
      return response.redirect().back()
    }

    return this.createPaymentFlow({
      ctx: { request, params, response, session } as HttpContext,
      booking,
      amount,
      orderPrefix: 'FULL',
      customField: 'full_payment',
      midtransFieldKey: 'midtransFullPaymentId',
      transactionField: 'fullPayment',
    })
  }

  async show({ inertia, params }: HttpContext) {
    const transaction = await Transaction.query()
      .whereHas('booking', (query) => query.where('number', params.id))
      .preload('booking')
      .first()

    return inertia.render('transactions/payment', {
      transaction,
    })
  }

  async notification({ request, response, session }: HttpContext) {
    const notification = request.body() as MidtransNotification

    const isValidSignature = await this.verifySignature(notification)
    if (!isValidSignature) {
      logger.warn('Invalid Midtrans signature for order ' + notification.order_id)
      session.flash('general_errors', 'Signature tidak valid')
      return response.redirect().back()
    }

    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { order_id, transaction_status, transaction_id, settlement_time, custom_field1 } =
        notification

      const booking = await Booking.query()
        .where('number', order_id.split('_')[1])
        .preload('address')
        .preload('status')
        .first()
      if (!booking) {
        session.flash('general_errors', 'Booking tidak ditemukan')
        return response.redirect().back()
      }

      // Determine which leg of payment this notification belongs to
      const type: 'dp' | 'full' =
        custom_field1 === 'down_payment' ? 'dp' : custom_field1 === 'full_payment' ? 'full' : 'dp'

      const transaction = await this.getTransactionByMidtransId(transaction_id, type)

      if (type === 'dp' && transaction_status === 'settlement') {
        await transaction
          .merge({
            midtransDownPaymentStatus: transaction_status,
            downPaymentAt: settlement_time
              ? DateTime.fromSQL(settlement_time)
              : transaction.downPaymentAt,
            // Only mark transaction partially paid on settlement of DP
            status: TransactionStatuses.PARTIALLY_PAID,
          })
          .save()

        await BookingStatus.create({
          bookingId: booking.id,
          name: BookingStatuses.PICKUP_SCHEDULED,
        })

        transmit.broadcast(`payments/${booking.number}/dp`, {
          status: transaction_status,
        })
      }

      if (type === 'full' && transaction_status === 'settlement') {
        await transaction
          .merge({
            midtransFullPaymentStatus: transaction_status,
            fullPaymentAt: settlement_time
              ? DateTime.fromSQL(settlement_time)
              : transaction.fullPaymentAt,
            // Only mark fully paid on settlement of full payment
            status: TransactionStatuses.PAID,
          })
          .save()

        await BookingStatus.create({
          bookingId: booking.id,
          name: BookingStatuses.IN_PROCESS,
        })

        transmit.broadcast(`payments/${booking.number}/full`, {
          status: transaction_status,
        })
      }

      return response.redirect().toRoute('bookings.show', { id: booking.number })
    } catch (error) {
      logger.error(`Failed processing Midtrans notification: ${error.message}`)
      return response
        .redirect()
        .toRoute('bookings.show', { id: notification.order_id.split('_')[1] })
    }
  }

  private computeDpAmount(booking: Booking) {
    if (booking.address.radius > 10000) return 20000
    if (booking.address.radius > 5000) return 15000
    return 10000
  }

  private async sendCharge(body: MidtransChargeBody) {
    const serverKey = env.get('MIDTRANS_SERVER_KEY')
    const apiKey = Buffer.from(`${serverKey}:`).toString('base64')

    const options: FetchOptions = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Basic ${apiKey}`,
      },
      body: JSON.stringify(body),
    }

    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', options)
    if (!response.ok) {
      throw new Error(`Midtrans responded with status ${response.status}`)
    }

    return (await response.json()) as MidtransResponse
  }

  private async createPaymentFlow({
    ctx,
    booking,
    amount,
    orderPrefix,
    customField,
    midtransFieldKey = 'midtransDownPaymentId',
    transactionField = 'downPayment',
  }: CreateTransactionFlow) {
    const { session, response, request } = ctx
    const key = `payment_${orderPrefix}_${request.ip()}_${booking.number}`
    const paymentLimiter = limiter.use({
      requests: 1,
      duration: '15 min',
    })

    const orderId = `${orderPrefix}_${booking.number}_${DateTime.now().toFormat('yyyyMMddHHmmss')}`

    const body: MidtransChargeBody = {
      payment_type: 'qris',
      qris: { acquirer: 'gopay' },
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        name: booking.address.name,
        phone: booking.address.phone,
        address: booking.address.street,
      },
      item_details: {
        id: booking.id,
        name: `Booking ${booking.number}`,
        price: amount,
        quantity: 1,
      },
      custom_field1: customField,
    }

    try {
      await paymentLimiter.consume(key)
      const result = await this.sendCharge(body)

      const recordPayload: TransactionCreatePayload = {
        bookingId: booking.id,
        status: TransactionStatuses.PENDING,
      }
      recordPayload[transactionField] = amount

      if (midtransFieldKey === 'midtransDownPaymentId') {
        recordPayload.midtransDownPaymentId = result.transaction_id
        recordPayload.midtransDownPaymentStatus = TransactionStatuses.PENDING
      } else {
        recordPayload.midtransFullPaymentId = result.transaction_id
        recordPayload.midtransFullPaymentStatus = TransactionStatuses.PENDING
      }

      await Transaction.create(recordPayload)

      return response.redirect().toRoute('transactions.show', { id: booking.number })
    } catch (error: any) {
      if (error instanceof errors.E_TOO_MANY_REQUESTS) {
        logger.warn('Too many payment attempts detected.')
        session.flash(
          'limiter_errors',
          'Terlalu banyak percobaan pembayaran. Silakan coba lagi nanti.'
        )
      } else {
        logger.error(`Payment creation failed: ${error.message}`)
        session.flash('general_errors', 'Gagal membuat transaksi. Silakan coba lagi.')
      }
      return response.redirect().back()
    }
  }

  private async verifySignature(notification: MidtransNotification) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { order_id, status_code, gross_amount, signature_key } = notification
    const serverKey = env.get('MIDTRANS_SERVER_KEY')
    const hashString = order_id + status_code + gross_amount + serverKey
    const calculatedSignature = createHash('sha512').update(hashString).digest('hex')
    return calculatedSignature === signature_key
  }

  private async getTransactionByMidtransId(transactionId: string, type: 'dp' | 'full') {
    let query = Transaction.query()
    if (type === 'dp') {
      query = query.where('midtrans_down_payment_id', transactionId).preload('booking')
    } else {
      query = query.where('midtrans_full_payment_id', transactionId).preload('booking')
    }
    const record = await query.first()
    if (!record) throw new Error('Transaction not found for midtrans id ' + transactionId)
    return record
  }
}
