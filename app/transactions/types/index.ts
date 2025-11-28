import Booking from '#bookings/models/booking'
import type { HttpContext } from '@adonisjs/core/http'

export interface CreateTransactionFlow {
  ctx: HttpContext
  booking: Booking
  amount: number
  type: 'down_payment' | 'full_payment'
  orderPrefix: string
}

export interface MidtransNotification {
  transaction_type: string
  transaction_time: string
  transaction_status: string
  transaction_id: string
  status_message: string
  status_code: string
  signature_key: string
  settlement_time: string
  payment_type: string
  order_id: string
  merchant_id: string
  issuer: string
  gross_amount: string
  fraud_status: string
  currency: string
  acquirer: string
  expiry_time?: string
  custom_field1: string
}
