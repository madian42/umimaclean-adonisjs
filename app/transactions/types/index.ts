import Booking from '#bookings/models/booking'
import type { HttpContext } from '@adonisjs/core/http'

export interface MidtransResponse {
  status_code: string
  status_message: string
  transaction_id: string
  order_id: string
  merchant_id: string
  gross_amount: string
  currency: string
  payment_type: string
  transaction_time: string
  transaction_status: string
  fraud_status: string
  acquirer: string
  actions: Array<{
    name: string
    method: string
    url: string
  }>
  qr_string: string
  expiry_time: string
}

export interface FetchOptions {
  method: 'POST'
  headers: Record<string, string>
  body: string
}

export interface MidtransChargeBody {
  payment_type: 'qris'
  qris: { acquirer: 'gopay' }
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  customer_details: {
    name: string
    phone: string
    address: string
  }
  item_details: {
    id: string | number
    name: string
    price: number
    quantity: number
  }
  custom_field1: string
}

export interface TransactionCreatePayload {
  bookingId: string
  midtransDownPaymentId?: string
  midtransFullPaymentId?: string
  midtransDownPaymentStatus?: string
  midtransFullPaymentStatus?: string
  downPayment?: number
  fullPayment?: number
  status?: string
}

export interface CreateTransactionFlow {
  ctx: HttpContext
  booking: Booking
  amount: number
  orderPrefix: string
  customField: string
  midtransFieldKey?: 'midtransDownPaymentId' | 'midtransFullPaymentId'
  transactionField?: 'downPayment' | 'fullPayment'
}
