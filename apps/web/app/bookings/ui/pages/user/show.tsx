import UserLayout from '#common/ui/components/user-layout'
import { formatDate, getStatusLabel } from '#common/ui/lib/utils'
import { Link } from '@tuyau/inertia/react'
import { Button } from '@umimaclean/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@umimaclean/ui/components/card'
import { ArrowLeft, Calendar, ChevronRight, MapPin, Truck, X } from '@umimaclean/ui/lib/icons'
import { cn } from '@umimaclean/ui/lib/utils'
import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@umimaclean/ui/components/accordion'
import { Separator } from '@umimaclean/ui/components/separator'
import { Badge } from '@umimaclean/ui/components/badge'

type PriceLine = { label: string; amount: number }
type ServiceItem = {
  title: string
  attributes: string[] // e.g., ["Nike Adidas", "Kanvas", "42", "Lari"]
  prices: PriceLine[] // e.g., [{ label: "Cuci Medium", amount: 25000 }, { label: "Pemutihan", amount: 10000 }]
}

function formatIDR(n: number) {
  return n.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function PhotoThumb({ src, label }: { src?: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="aspect-square w-full overflow-hidden rounded-md border border-border bg-muted">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src || '/placeholder.svg'} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            No photo
          </div>
        )}
      </div>
      <span className="text-[10px]">{label}</span>
    </div>
  )
}

function ServiceItemCard({ item, className }: { item: ServiceItem; className?: string }) {
  return (
    <Card className={cn('p-4 shadow-sm gap-2', className)}>
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold tracking-tight">{item.title}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {item.attributes.map((attr, i) => (
          <span
            key={i}
            className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
          >
            {attr}
          </span>
        ))}
      </div>

      <div className="space-y-1">
        {item.prices.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] items-center">
            <span className={cn('text-sm', i === 0 ? 'font-medium' : 'text-muted-foreground')}>
              {p.label}
            </span>
            <span className={cn('text-sm tabular-nums', i === 0 ? 'font-semibold' : '')}>
              {formatIDR(p.amount)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function BookingDetailPage({ booking }: { booking: any }) {
  const [openService, setOpenService] = useState<string>('') // Change to string to match accordion value
  const [openDetail, setOpenDetail] = useState<string>('') // Change to string to match accordion value
  const items: ServiceItem[] = [
    {
      title: 'Nike Adidas',
      attributes: ['Kanvas', '42', 'Lari'],
      prices: [{ label: 'Cuci Medium', amount: 25000 }],
    },
    {
      title: 'Nike Adidas',
      attributes: ['Kanvas', '42', 'Lari'],
      prices: [
        { label: 'Cuci Medium', amount: 25000 },
        { label: 'Pemutihan', amount: 10000 },
      ],
    },
    {
      title: 'Docmart',
      attributes: ['Kulit', '42', 'Boot'],
      prices: [
        { label: 'Cuci Light', amount: 20000 },
        { label: 'Bahan Kulit', amount: 10000 },
      ],
    },
  ]

  const total = items.flatMap((it) => it.prices).reduce((sum, p) => sum + p.amount, 0)
  const due = Math.max(total - 15000, 0)

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
                  <Badge
                    variant="outline"
                    className={cn('text-base', getStatusColor(booking.status[0].name))}
                  >
                    {getStatusLabel(booking.status[booking.status.length - 1].name)}
                  </Badge>
                </div>
                <p className="text-sm ml-10 text-gray-700">
                  {formatDate(booking.status[booking.status.length - 1].updatedAt)}
                </p>

                {booking.status[booking.status.length - 1].name === 'waiting_deposit' && (
                  <Button className="ml-10 mt-3 cursor-pointer">Pembayaran DP</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {booking.service && (
            <Card className="gap-4">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Detail Layanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length > 1 ? (
                  <>
                    <ServiceItemCard key={0} item={items[0]} />
                    <Accordion
                      value={openService}
                      onValueChange={setOpenService}
                      type="single"
                      collapsible
                    >
                      <AccordionItem value="item-1">
                        <AccordionContent className="space-y-3">
                          {items.slice(1).map((item, idx) => (
                            <ServiceItemCard key={idx + 1} item={item} />
                          ))}
                        </AccordionContent>
                        <AccordionTrigger className="flex cursor-pointer justify-center py-0">
                          {openService === 'item-1' ? 'Lihat Lebih Sedikit' : 'Lihat Semua'}
                        </AccordionTrigger>
                      </AccordionItem>
                    </Accordion>
                  </>
                ) : (
                  <ServiceItemCard key={0} item={items[0]} />
                )}

                <div className="rounded-lg bg-secondary p-3">
                  <div className="grid grid-cols-[1fr_auto] items-center">
                    <span className="text-sm font-medium">Total Layanan</span>
                    <span className="text-sm font-semibold tabular-nums">{formatIDR(total)}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-[1fr_auto] items-center">
                    <span className="text-xs text-muted-foreground">Uang Muka</span>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      -{formatIDR(15000)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-[1fr_auto] items-center border-t pt-2">
                    <span className="text-sm font-semibold">Sisa Pembayaran</span>
                    <span className="text-sm font-bold tabular-nums">{formatIDR(due)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

          {booking.photos && (
            <Card className="gap-2">
              <CardHeader>
                <CardTitle>Bukti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <PhotoThumb src={''} label="Pickup" />
                  <PhotoThumb src={''} label="Condition" />
                  <PhotoThumb src={''} label="Delivered" />
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
                <span className="text-sm">{formatDate(booking.createdAt)}</span>
              </div>
              <Accordion value={openDetail} onValueChange={setOpenDetail} type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionContent className="space-y-3">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waktu Pembuatan</span>
                      <span className="text-sm">{formatDate(booking.createdAt)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waktu Penjemputan</span>
                      <span className="text-sm">{formatDate(booking.date)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waktu Pengecekan</span>
                      <span className="text-sm">{formatDate(booking.date)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waktu Pengantaran</span>
                      <span className="text-sm">{formatDate(booking.date)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waktu Pesanan Selesai</span>
                      <span className="text-sm">{formatDate(booking.date)}</span>
                    </div>
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
