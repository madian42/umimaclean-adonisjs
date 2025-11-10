import { formatDate, getStatusLabel } from '#common/ui/lib/utils'
import { Link } from '@tuyau/inertia/react'
import { Button } from '@umimaclean/ui/components/button'
import { Card, CardContent } from '@umimaclean/ui/components/card'
import { ClipboardList } from '@umimaclean/ui/lib/icons'
import { cn } from '@umimaclean/ui/lib/utils'
import { Booking } from '#core/types/type'

export default function BookingTabs({
  items,
  isLoading,
  isSearch,
}: {
  items: Booking[]
  isLoading: boolean
  isSearch: boolean
}) {
  function getStatusDisplay(booking: Booking) {
    const latestStatus = booking.status[0]
    if (!latestStatus) return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' }

    const statusConfig = {
      waiting_deposit: { text: 'Menunggu DP', className: 'bg-yellow-100 text-yellow-800' },
      pickup_scheduled: { text: 'Pickup Terjadwal', className: 'bg-blue-100 text-blue-800' },
      pickup_progress: { text: 'Pickup Progress', className: 'bg-blue-100 text-blue-800' },
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

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Memuat data...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Tidak ada booking ditemukan</h3>
          <p className="text-muted-foreground">
            {isSearch
              ? 'Coba ubah kriteria pencarian atau filter Anda'
              : 'Belum ada booking yang dibuat'}
          </p>
        </div>
      ) : (
        items.map((booking) => {
          const statusDisplay = getStatusDisplay(booking)
          return (
            <Card key={booking.id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-semibold">{booking.number}</h3>
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs font-medium',
                          statusDisplay.className
                        )}
                      >
                        {booking.status.length > 0
                          ? getStatusLabel(booking.status[0].name)
                          : 'Status Tidak Diketahui'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tanggal booking: {formatDate(booking.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dibuat: {formatDate(booking.createdAt)}
                    </p>
                  </div>
                  <Link route="bookings.show" params={{ id: booking.number }}>
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      Lihat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
