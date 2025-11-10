import BookingStatuses from '#core/enums/booking_status_enum'

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  const formattedDate = date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const formattedTime = date.toLocaleTimeString('id-ID', {
    hour: 'numeric',
    minute: 'numeric',
  })

  return `${formattedDate} ${formattedTime}`
}

export function getStatusLabel(status: string) {
  switch (status) {
    case BookingStatuses.WAITING_DEPOSIT:
      return 'Menunggu Deposit'
    case BookingStatuses.PICKUP_SCHEDULED:
      return 'Jadwal Penjemputan'
    case BookingStatuses.PICKUP_PROGRESS:
      return 'Proses Penjemputan'
    case BookingStatuses.INSPECTION:
      return 'Inspeksi'
    case BookingStatuses.WAITING_PAYMENT:
      return 'Menunggu Pembayaran'
    case BookingStatuses.IN_PROCESS:
      return 'Dalam Proses'
    case BookingStatuses.PROCESS_COMPLETED:
      return 'Proses Selesai'
    case BookingStatuses.DELIVERY:
      return 'Pengiriman'
    case BookingStatuses.COMPLETED:
      return 'Selesai'
    case BookingStatuses.CANCELLED:
      return 'Dibatalkan'
    default:
      return status
  }
}
