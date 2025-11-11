import { getStatusDisplay } from '@/lib/utils'
import { Link } from '@tuyau/inertia/react'
import { Button } from '@/components/button'
import { Card, CardContent } from '@/components/card'
import { cn } from '@/lib/utils'
import { Booking } from '#core/types/type'
import { ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function BookingTabs({
  items,
  isLoading,
  isSearch,
}: {
  items: Booking[]
  isLoading: boolean
  isSearch: boolean
}) {
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
                        {booking.status.length > 0 ? statusDisplay.text : 'Status Tidak Diketahui'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tanggal booking: {format(booking.date, 'd MMM yyyy H:mm', { locale: id })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dibuat: {format(booking.createdAt, 'd MMM yyyy H:mm', { locale: id })}
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
