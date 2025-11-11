import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Booking } from '#core/types/type'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusDisplay(booking: Booking) {
  const latestStatus = booking.status[0]
  if (!latestStatus) return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' }

  const statusConfig = {
    waiting_deposit: { text: 'Menunggu Deposit', className: 'bg-yellow-100 text-yellow-800' },
    pickup_scheduled: { text: 'Penjemputan Dijadwalkan', className: 'bg-blue-100 text-blue-800' },
    pickup_progress: { text: 'Proses Penjemputan', className: 'bg-blue-100 text-blue-800' },
    inspection: { text: 'Inspeksi', className: 'bg-purple-100 text-purple-800' },
    waiting_payment: { text: 'Menunggu Pembayaran', className: 'bg-yellow-100 text-yellow-800' },
    in_process: { text: 'Dalam Proses', className: 'bg-orange-100 text-orange-800' },
    process_completed: { text: 'Proses Selesai', className: 'bg-green-100 text-green-800' },
    delivery: { text: 'Pengiriman', className: 'bg-blue-100 text-blue-800' },
    completed: { text: 'Selesai', className: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
  }

  return (
    statusConfig[latestStatus.name as keyof typeof statusConfig] || {
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
