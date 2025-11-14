import { getStatusDisplay } from '@/lib/utils'
import { Card, CardContent } from '@/components/card'
import { Booking, SharedData } from '#core/types/type'
import { Calendar, Camera, ClipboardList, Truck } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Badge } from '#common/ui/components/badge'
import { Button } from '#common/ui/components/button'
import { useRouter } from '@tuyau/inertia/react'
import { usePage } from '@inertiajs/react'
import BookingStatuses from '#core/enums/booking_status_enum'
import { toast } from 'sonner'

export default function StaffBookingTabs({
  items,
  isLoading,
  isSearch,
}: {
  items: Booking[]
  isLoading: boolean
  isSearch: boolean
}) {
  const { auth } = usePage<SharedData>().props
  const currentUserId = auth.user.id
  const router = useRouter()

  async function pickup(id: string) {
    router.visit(
      { route: 'staff.bookings.ship', params: { id, stage: 'pickup' } },
      {
        method: 'get',
        onError: (errors) => {
          if (errors?.general_errors) {
            toast.error(errors.general_errors)
          }
        },
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{booking.number}</h3>
                  </div>
                  <Badge className={statusDisplay.className}>
                    <span className="ml-1">{statusDisplay.text}</span>
                  </Badge>
                </div>

                <div
                  className={`space-y-2 text-sm ${
                    (booking.status?.[0]?.name === BookingStatuses.PICKUP_SCHEDULED &&
                      !booking.adminId) ||
                    booking.adminId === currentUserId ||
                    booking.status?.[0]?.name === BookingStatuses.PICKUP_PROGRESS ||
                    booking.status?.[0]?.name === BookingStatuses.DELIVERY ||
                    booking.status?.[0]?.name === BookingStatuses.INSPECTION
                      ? 'mb-4'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {format(booking.date, 'd MMM yyyy H:mm', { locale: id })}
                  </div>
                </div>

                <div className="flex gap-2">
                  {booking.status[0].name === BookingStatuses.PICKUP_SCHEDULED &&
                    !booking.adminId && (
                      <Button size="sm" className="flex-1" onClick={() => pickup(booking.number)}>
                        <Truck className="w-4 h-4 mr-1" />
                        Ambil Pesanan
                      </Button>
                    )}

                  {booking.adminId === currentUserId && (
                    <Button size="sm" variant="outline" className="flex-1 bg-red-100 text-red-700">
                      Lepas Pesanan
                    </Button>
                  )}

                  {booking.status[0].name === BookingStatuses.PICKUP_PROGRESS && (
                    <>
                      <Button size="sm" className="flex-1">
                        <Camera className="w-4 h-4 mr-1" />
                        Foto Pengambilan
                      </Button>
                    </>
                  )}

                  {booking.status[0].name === BookingStatuses.DELIVERY && (
                    <Button size="sm" className="flex-1">
                      <Camera className="w-4 h-4 mr-1" />
                      Foto Delivery
                    </Button>
                  )}

                  {booking.status[0].name === BookingStatuses.INSPECTION && (
                    <>
                      <Button size="sm" className="flex-1">
                        <Camera className="w-4 h-4 mr-1" />
                        Assessment
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
