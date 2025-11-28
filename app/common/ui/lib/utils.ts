import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Booking } from '#core/types/type'
import BookingStatuses from '#core/enums/booking_status_enum'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BookingStatusDisplay: Record<BookingStatuses, { text: string; className: string }> = {
  [BookingStatuses.WAITING_DEPOSIT]: {
    text: 'Menunggu Deposit',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [BookingStatuses.PICKUP_SCHEDULED]: {
    text: 'Penjemputan Dijadwalkan',
    className: 'bg-blue-100 text-blue-800',
  },
  [BookingStatuses.PICKUP_PROGRESS]: {
    text: 'Proses Penjemputan',
    className: 'bg-blue-100 text-blue-800',
  },
  [BookingStatuses.INSPECTION]: { text: 'Inspeksi', className: 'bg-purple-100 text-purple-800' },
  [BookingStatuses.WAITING_PAYMENT]: {
    text: 'Menunggu Pembayaran',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [BookingStatuses.IN_PROCESS]: {
    text: 'Dalam Proses',
    className: 'bg-orange-100 text-orange-800',
  },
  [BookingStatuses.PROCESS_COMPLETED]: {
    text: 'Proses Selesai',
    className: 'bg-green-100 text-green-800',
  },
  [BookingStatuses.DELIVERY]: { text: 'Pengiriman', className: 'bg-blue-100 text-blue-800' },
  [BookingStatuses.COMPLETED]: { text: 'Selesai', className: 'bg-green-100 text-green-800' },
  [BookingStatuses.CANCELLED]: { text: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
}

export function findStatusCodesByDisplaySearch(term: string): BookingStatuses[] {
  if (!term) return []
  const lower = term.toLowerCase()
  return Object.entries(BookingStatusDisplay)
    .filter(([, v]) => v.text.toLowerCase().includes(lower))
    .map(([k]) => k as BookingStatuses)
}

export function getStatusDisplay(booking: Booking) {
  const latestStatus = Array.isArray(booking.statuses) ? booking.statuses[0] : null
  if (!latestStatus) return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' }

  return (
    BookingStatusDisplay[latestStatus.name as keyof typeof BookingStatusDisplay] || {
      text: latestStatus.name,
      className: 'bg-gray-100 text-gray-800',
    }
  )
}

export function formatIDR(price: number) {
  return price.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
}
