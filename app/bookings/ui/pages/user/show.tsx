import UserLayout from '@/components/layouts/user-layout'
import { Link, useRouter } from '@tuyau/inertia/react'
import { Button } from '@/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card'
import { ArrowLeft, Calendar, ChevronRight, MapPin, Truck, X } from 'lucide-react'
import { cn, getStatusDisplay } from '@/lib/utils'
import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion'
import { Separator } from '@/components/separator'
import { Badge } from '@/components/badge'
import { Booking } from '#core/types/type'
import PhotoThumb from '#bookings/ui/components/photo-thumb'
import ServiceItemCard from '#bookings/ui/components/service-item'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function BookingDetailPage({ booking }: { booking: Booking }) {
  const router = useRouter()

  const statusDisplay = getStatusDisplay(booking)
  const [openDetail, setOpenDetail] = useState<string>('')

  async function handleDownPayment() {
    router.visit(
      { route: 'transactions.create_dp', params: { id: booking.id } },
      {
        method: 'post',
        onSuccess: () => {
          toast.success('Pembayaran DP berhasil dibuat. Silakan lanjutkan pembayaran.')
        },
        onError: (errors) => {
          if (errors?.general_errors) {
            toast.error(errors.general_errors)
          }

          if (errors?.limiter_errors) {
            toast.error(errors.limiter_errors)
          }
        },
      }
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <Link route="bookings.index">
              <Button variant="ghost" size="sm" className="p-2 cursor-pointer h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Detail Booking</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium mb-2">Booking Tidak Ditemukan</h3>
            <p className="text-gray-500 text-sm mb-4">Booking dengan ID tidak ditemukan</p>
            <Link route="bookings.index">
              <Button variant="outline">Kembali ke Daftar Booking</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <UserLayout>
      <div className="min-h-screen md:min-h-[calc(100vh-39px)] bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <Link route="bookings.index">
              <Button variant="ghost" size="sm" className="p-2 cursor-pointer h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Detail Booking</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 pb-20 space-y-4">
          <Card className="gap-2">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Status Pesanan</CardTitle>
              <Link route="bookings.index">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div>
                <div className="flex space-x-2 items-center">
                  <Truck />
                  <Badge variant="outline" className={cn('text-base', statusDisplay.className)}>
                    {statusDisplay.text}
                  </Badge>
                </div>
                <p className="text-sm ml-10 text-gray-700">
                  {format(booking.status[0].updatedAt, 'd MMM yyyy H:mm', {
                    locale: id,
                  })}
                </p>

                {booking.status[0].name === 'waiting_deposit' && (
                  <Button onClick={handleDownPayment} className="ml-10 mt-3 cursor-pointer">
                    Pembayaran DP
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {booking.service && <ServiceItemCard />}

          {/* Informasi Pelanggan */}
          <Card className="gap-2">
            <CardHeader className="flex items-center">
              <MapPin className="w-4 h-4" />
              <CardTitle>Alamat Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {booking.address.name}{' '}
                <span className="font-normal">({booking.address.phone})</span>
              </p>
              <p className="text-sm">{booking.address.street}</p>
            </CardContent>
          </Card>

          {booking.photos && booking.photos.length > 0 && (
            <Card className="gap-2">
              <CardHeader>
                <CardTitle>Bukti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <PhotoThumb
                    src={`/storage/${booking.photos[0]?.path}`}
                    label={booking.photos[0]?.stage}
                  />
                  <PhotoThumb
                    src={`/storage/${booking.photos[1]?.path}`}
                    label={booking.photos[1]?.stage}
                  />
                  <PhotoThumb
                    src={`/storage/${booking.photos[2]?.path}`}
                    label={booking.photos[2]?.stage}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jadwal & Waktu */}
          <Card className="gap-2 pt-6 pb-0">
            <CardHeader className="flex justify-between">
              <CardTitle>No. Pesanan</CardTitle>
              <p className="font-medium">{booking.number}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nota Pesanan</span>
                <span className="text-sm">
                  {format(booking.createdAt, 'd MMM yyyy H:mm', { locale: id })}
                </span>
              </div>
              <Accordion value={openDetail} onValueChange={setOpenDetail} type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionContent className="space-y-3">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waktu Pembuatan</span>
                      <span className="text-sm">
                        {format(booking.createdAt, 'd MMM yyyy H:mm', { locale: id })}
                      </span>
                    </div>
                    {booking.photos && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Waktu Penjemputan</span>
                          <span className="text-sm">
                            {format(booking.date, 'd MMM yyyy H:mm', { locale: id })}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Waktu Pengecekan</span>
                          <span className="text-sm">
                            {format(booking.date, 'd MMM yyyy H:mm', { locale: id })}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Waktu Pengantaran</span>
                          <span className="text-sm">
                            {format(booking.date, 'd MMM yyyy H:mm', { locale: id })}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Waktu Pesanan Selesai</span>
                          <span className="text-sm">
                            {format(booking.date, 'd MMM yyyy H:mm', { locale: id })}
                          </span>
                        </div>
                      </>
                    )}
                  </AccordionContent>
                  <AccordionTrigger className="flex cursor-pointer justify-center pt-2">
                    {openDetail === 'item-1' ? 'Lihat Lebih Sedikit' : 'Lihat Semua'}
                  </AccordionTrigger>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* {booking.status[booking.status.length - 1].name === 'waiting_deposit' && (
              <>
                <Button
                  // onClick={handleConfirmBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Konfirmasi Booking
                </Button>
                <Button
                  // onClick={handleCancelBooking}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 h-11 bg-transparent"
                >
                  <X className="w-4 h-4 mr-2" />
                  Batalkan Booking
                </Button>
              </>
            )} */}

            {/* {booking.status === 'confirmed' && (
            <>
              <Button
                onClick={handleCompleteBooking}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
              >
                <Check className="w-4 h-4 mr-2" />
                Tandai Selesai
              </Button>
              <Button
                onClick={handleEditBooking}
                variant="outline"
                className="w-full h-11 bg-transparent"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Booking
              </Button>
              <Button
                onClick={handleCancelBooking}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 h-11 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Batalkan Booking
              </Button>
            </>
          )} */}

            <Button
              variant="outline"
              className="w-full cursor-pointer border-red-200 text-red-600 hover:bg-red-50 h-11 bg-transparent"
            >
              <X className="w-4 h-4" />
              Batalkan Booking
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
