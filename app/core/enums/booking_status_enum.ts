enum BookingStatuses {
  WAITING_DEPOSIT = 'waiting_deposit',
  PICKUP_SCHEDULED = 'pickup_scheduled',
  PICKUP_PROGRESS = 'pickup_progress',
  INSPECTION = 'inspection',
  WAITING_PAYMENT = 'waiting_payment',
  IN_PROCESS = 'in_process',
  PROCESS_COMPLETED = 'process_completed',
  DELIVERY = 'delivery',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export default BookingStatuses
