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
} from '#transactions/types/index'

export default class TransactionController {
  async createDP({ request, params, response, session }: HttpContext) {
    const booking = await Booking.query().where('id', params.id).preload('address').first()
    if (!booking) {
      session.flash('general_error', 'Booking tidak ditemukan')
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
    const amount = request.input('amount')

    const booking = await Booking.query().where('id', params.id).preload('address').first()
    if (!booking) {
      session.flash('general_error', 'Booking tidak ditemukan')
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
    const transactionId = await Transaction.query().where('booking_id', params.id).first()

    return inertia.render('transactions/show', {
      transactionId,
    })
  }

  private computeDpAmount(booking: Booking) {
    if (booking.address.radius > 10000) return 20000
    if (booking.address.radius > 5000) return 15000
    return 10000
  }

  private buildMidtransOptions(body: MidtransChargeBody): FetchOptions {
    const serverKey = env.get('MIDTRANS_SERVER_KEY')
    const apiKey = Buffer.from(`${serverKey}:`).toString('base64')
    return {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Basic ${apiKey}`,
      },
      body: JSON.stringify(body),
    }
  }

  private async sendCharge(options: FetchOptions) {
    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', options)
    if (!response.ok) {
      throw new Error(`Midtrans responded with status ${response.status}`)
    }
    return (await response.json()) as MidtransResponse
  }

  private async createTransactionRecord(payload: TransactionCreatePayload) {
    return Transaction.create(payload)
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
      const options = this.buildMidtransOptions(body)
      const result = await this.sendCharge(options)

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

      await this.createTransactionRecord(recordPayload)
      return response.redirect().toRoute('transactions.show', { id: booking.id })
    } catch (error) {
      if (error instanceof errors.E_TOO_MANY_REQUESTS) {
        logger.warn('Too many payment attempts detected.')
        session.flash(
          'limiter_errors',
          'Terlalu banyak percobaan pembayaran. Silakan coba lagi nanti.'
        )
      } else {
        logger.error('Gagal membuat transaksi: ' + (error.message ?? String(error)))
        session.flash('general_error', 'Gagal membuat transaksi. Silakan coba lagi.')
      }
      return response.redirect().back()
    }
  }
}
