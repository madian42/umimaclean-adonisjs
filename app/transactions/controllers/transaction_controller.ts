import Booking from '#bookings/models/booking'
import TransactionStatuses from '#core/enums/transaction_status_enum'
import env from '#start/env'
import Transaction from '#transactions/models/transaction'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { errors } from '@adonisjs/limiter'
import limiter from '@adonisjs/limiter/services/main'
import { DateTime } from 'luxon'
import { MidtransNotification, CreateTransactionFlow } from '#transactions/types/index'
import { createHash } from 'node:crypto'
import BookingStatus from '#bookings/models/booking_status'
import BookingStatuses from '#core/enums/booking_status_enum'
import transmit from '@adonisjs/transmit/services/main'
import { createRequire } from 'node:module'
import db from '@adonisjs/lucid/services/db'

const require = createRequire(import.meta.url)
const midtransClient = require('midtrans-client')

/**
 * Controller for handling payment transactions
 *
 * Business Logic:
 * - Supports two-stage payment: Down Payment (DP) and Full Payment
 * - Integrates with Midtrans payment gateway (QRIS)
 * - Each transaction is separate record with type (down_payment/full_payment)
 * - Validates signatures to prevent payment fraud
 * - Updates booking status based on payment completion
 * - Broadcasts real-time updates via WebSocket (transmit)
 */
export default class TransactionController {
  coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: env.get('MIDTRANS_SERVER_KEY'),
  })

  /**
   * Create Down Payment (DP) transaction
   *
   * Business Logic:
   * - DP is calculated based on delivery radius
   * - Base: 15,000 IDR for first 5km
   * - Additional: 5,000 IDR per 5km block
   * - Customer must pay DP before pickup can be scheduled
   */
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
      type: 'down_payment',
      orderPrefix: 'DP',
    })
  }

  /**
   * Create Full Payment transaction
   *
   * Business Logic:
   * - Full payment covers all services selected by customer
   * - Amount is calculated from service items + any additional charges
   * - Customer pays after inspection is complete
   * - Payment triggers "In Process" status
   */
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
      type: 'full_payment',
      orderPrefix: 'FULL',
    })
  }

  /**
   * Display payment page with QR code
   *
   * Business Logic:
   * - Shows pending transaction for customer to scan QR
   * - Displays transaction details and amount
   * - Auto-refreshes on payment status change via WebSocket
   */
  async show({ inertia, params }: HttpContext) {
    const transaction = await Transaction.query()
      .preload('booking', (query) => query.where('number', params.id))
      .orderBy('created_at', 'desc')
      .first()

    return inertia.render('transactions/payment', {
      transaction,
    })
  }

  /**
   * Handle webhook notification from Midtrans
   *
   * Business Logic:
   * - Midtrans sends notification when payment status changes
   * - Validates signature to ensure request is authentic
   * - Updates transaction status based on Midtrans response
   * - Creates booking status records to track workflow
   * - Broadcasts update to frontend for real-time UI refresh
   *
   * Payment Flow:
   * 1. DP settlement → Status: PICKUP_SCHEDULED
   * 2. Full payment settlement → Status: IN_PROCESS
   */
  async notification({ request, response, session }: HttpContext) {
    const notification = request.body() as MidtransNotification

    // Security: Verify signature to prevent fraud
    const isValidSignature = await this.verifySignature(notification)
    if (!isValidSignature) {
      logger.warn('Invalid Midtrans signature for order ' + notification.order_id)
      session.flash('general_errors', 'Signature tidak valid')
      return response.redirect().back()
    }

    const trx = await db.transaction()

    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { order_id, transaction_status, transaction_id, settlement_time } = notification

      // Extract booking number from order_id format: PREFIX_BOOKINGNUMBER_TIMESTAMP
      const bookingNumber = order_id.split('_')[1]
      const booking = await Booking.query()
        .where('number', bookingNumber)
        .preload('address')
        .preload('statuses')
        .first()

      if (!booking) {
        await trx.rollback()
        session.flash('general_errors', 'Booking tidak ditemukan')
        return response.redirect().back()
      }

      // Find transaction by Midtrans transaction ID
      const transaction = await Transaction.query({ client: trx })
        .where('midtrans_id', transaction_id)
        .preload('booking')
        .first()

      if (!transaction) {
        await trx.rollback()
        throw new Error('Transaction not found for midtrans id ' + transaction_id)
      }

      // Handle Down Payment settlement
      if (transaction.type === 'down_payment' && transaction_status === 'settlement') {
        await transaction
          .merge({
            midtransStatus: transaction_status,
            paymentAt: DateTime.fromSQL(settlement_time),
            status: TransactionStatuses.PAID,
          })
          .useTransaction(trx)
          .save()

        // Update booking: DP paid → ready for pickup scheduling
        const existingStatus = await BookingStatus.query({ client: trx })
          .where('booking_id', booking.id)
          .andWhere('name', BookingStatuses.PICKUP_SCHEDULED)
          .first()

        if (!existingStatus) {
          await BookingStatus.create(
            {
              bookingId: booking.id,
              name: BookingStatuses.PICKUP_SCHEDULED,
            },
            { client: trx }
          )
        }

        await trx.commit()

        // Real-time notification to customer's browser
        transmit.broadcast(`payments/${booking.number}/dp`, {
          status: transaction_status,
        })
      }

      // Handle Full Payment settlement
      if (transaction.type === 'full_payment' && transaction_status === 'settlement') {
        await transaction
          .merge({
            midtransStatus: transaction_status,
            paymentAt: DateTime.fromSQL(settlement_time),
            status: TransactionStatuses.PAID,
          })
          .useTransaction(trx)
          .save()

        // Update booking: Full payment → shoes can be processed
        const existingStatus = await BookingStatus.query({ client: trx })
          .where('booking_id', booking.id)
          .andWhere('name', BookingStatuses.IN_PROCESS)
          .first()

        if (!existingStatus) {
          await BookingStatus.create(
            {
              bookingId: booking.id,
              name: BookingStatuses.IN_PROCESS,
            },
            { client: trx }
          )
        }

        await trx.commit()

        // Real-time notification to customer's browser
        transmit.broadcast(`payments/${booking.number}/full`, {
          status: transaction_status,
        })
      }

      return response.redirect().toRoute('bookings.show', { id: booking.number })
    } catch (error) {
      await trx.rollback()

      logger.error(`Failed processing Midtrans notification: ${error.message}`)
      return response
        .redirect()
        .toRoute('bookings.show', { id: notification.order_id.split('_')[1] })
    }
  }

  /**
   * Calculate Down Payment amount based on delivery radius
   *
   * Formula:
   * - Base: 15,000 IDR (0-5km)
   * - +5,000 IDR per additional 5km block
   *
   * Example:
   * - 3km → 15,000
   * - 7km → 20,000
   * - 12km → 25,000
   */
  private computeDpAmount(booking: Booking) {
    const radius = booking.address.radius
    const baseAmount = 15000

    // Calculate extra blocks beyond first 5km
    const extraBlocks = Math.floor((radius - 5000) / 5000)

    return baseAmount + extraBlocks * 5000
  }

  /**
   * Generic payment flow creation
   *
   * Business Logic:
   * - Rate limiting: 1 attempt per 15 minutes per IP/booking
   * - Creates unique order ID with timestamp
   * - Generates QRIS code via Midtrans
   * - Stores transaction in pending state
   * - Redirects to payment page with QR code
   */
  private async createPaymentFlow({
    ctx,
    booking,
    amount,
    type,
    orderPrefix,
  }: CreateTransactionFlow) {
    const { session, response, request } = ctx

    // Rate limiting key: prevents payment spam
    const key = `payment_${orderPrefix}_${request.ip()}_${booking.number}`
    const paymentLimiter = limiter.use({
      requests: 1,
      duration: '15 min',
    })

    // Unique order ID format: PREFIX_BOOKINGNUMBER_TIMESTAMP
    const orderId = `${orderPrefix}_${booking.number}_${DateTime.now().toFormat('yyyyMMddHHmmss')}`

    try {
      await paymentLimiter.consume(key)

      // Call Midtrans API to create QRIS payment
      const result = await this.coreApi.charge({
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
      })

      // Store transaction in database
      await Transaction.create({
        bookingId: booking.id,
        type,
        amount,
        status: TransactionStatuses.PENDING,
        midtransStatus: TransactionStatuses.PENDING,
        midtransId: result.transaction_id,
      })

      // Show QR code page
      return response.redirect().toRoute('transactions.show', { id: booking.number })
    } catch (error) {
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

  /**
   * Verify Midtrans webhook signature
   *
   * Security:
   * - Prevents fake payment notifications
   * - Uses SHA512 hash of: order_id + status_code + amount + server_key
   * - Signature must match Midtrans-provided signature
   */
  private async verifySignature(notification: MidtransNotification) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { order_id, status_code, gross_amount, signature_key } = notification

    const serverKey = env.get('MIDTRANS_SERVER_KEY')
    const hashString = order_id + status_code + gross_amount + serverKey
    const calculatedSignature = createHash('sha512').update(hashString).digest('hex')

    return calculatedSignature === signature_key
  }
}
