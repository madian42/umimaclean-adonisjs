import { MapPin, User, Camera, CheckCircle, Upload, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tuyau/inertia/react'
import { Booking } from '#core/types/type'
import { Card, CardContent, CardHeader, CardTitle } from '#common/ui/components/card'
import { Button } from '#common/ui/components/button'
import { Badge } from '#common/ui/components/badge'
import { getStatusDisplay } from '#common/ui/lib/utils'
import StaticMap from '#users/ui/components/static-map'
import { Form, FormControl, FormField, FormItem, FormMessage } from '#common/ui/components/form'
import { Input } from '#common/ui/components/input'
import { z } from 'zod'

const fileSizeLimit = 5 * 1024 * 1024
const uploadShipPhotoSchema = z.object({
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif'].includes(file.type),
      { message: 'Tipe file tidak valid' }
    )
    .refine((file) => file.size <= fileSizeLimit, {
      message: 'Ukuran file tidak boleh melebihi 5MB',
    }),
})

type UploadShipPhotoPayload = z.infer<typeof uploadShipPhotoSchema>

export default function ShipMode({ booking }: { booking: Booking }) {
  const router = useRouter()

  const form = useForm<UploadShipPhotoPayload>({
    resolver: zodResolver(uploadShipPhotoSchema),
  })

  const statusDisplay = getStatusDisplay(booking)

  const imageFile = form.watch('image')
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (imageFile && imageFile instanceof File) {
      const url = URL.createObjectURL(imageFile)
      previewUrlRef.current = url
      return () => URL.revokeObjectURL(url)
    }
    previewUrlRef.current = null
  }, [imageFile])

  function handleMapClick() {
    const lat = booking.address.latitude
    const lng = booking.address.longitude
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  function handleCompletePickup(data: UploadShipPhotoPayload) {
    router.visit(
      { route: 'staff.bookings.upload', params: { id: booking.number, stage: 'pickup' } },
      {
        method: 'post',
        data,
        fresh: true,
        onSuccess: () => {
          form.reset()
          toast.success('Berhasil masuk!')
        },
        onError: (errors) => {
          if (errors?.general_errors) {
            toast.error(errors.general_errors)
          }
        },
      }
    )
  }

  function handleReleaseOrder() {
    if (
      confirm(
        'Apakah Anda yakin ingin melepas pesanan ini? Pesanan akan tersedia untuk admin lain.'
      )
    ) {
      // router.post(
      //   `/staff/task/${booking.id}/release`,
      //   {},
      //   {
      //     onSuccess: () => {
      //       alert('Pesanan berhasil dilepas dan tersedia untuk admin lain.')
      //     },
      //     onError: () => {
      //       alert('Gagal melepas pesanan.')
      //     },
      //   }
      // )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}

        <Card className="gap-2 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <User className="h-5 w-5 text-blue-600" />
              Info Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Nama Pelanggan
                </p>
                <p className="text-gray-800 font-medium">{booking.address.name}</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Nomer Telepon
                </p>
                <div className="flex items-center">
                  <p className="text-gray-800 font-medium">+62 {booking.address.phone}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto h-6 text-xs bg-transparent"
                  >
                    Call
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status Transaksi
                </p>
                <Badge className="border font-medium mt-1">{statusDisplay.text}</Badge>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin</p>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {booking.adminId ? booking.adminId : 'Belum Diambil'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Section */}
        <Card className="mb-6 gap-0 shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <MapPin className="h-5 w-5 text-blue-600" />
              Lokasi Pengambilan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">{booking.address.street}</p>
              <p className="text-sm text-gray-600 mt-1">Waktu: {booking.date}</p>
              {booking.address.note && (
                <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-blue-700 font-medium">
                    Catatan: {booking.address.note}
                  </p>
                </div>
              )}
            </div>

            {/* Map Placeholder */}
            <div
              className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden cursor-pointer hover:from-gray-300 hover:to-gray-400 transition-all duration-200 shadow-inner"
              onClick={handleMapClick}
            >
              <StaticMap
                latitude={booking.address.latitude}
                longitude={booking.address.longitude}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border">
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Klik untuk buka di Google Maps
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload Section */}
        <Card className="mb-6 gap-0 shadow-sm border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Camera className="h-5 w-5 text-green-600" />
              Bukti Pengambilan Sepatu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              {previewUrlRef.current ? (
                <div className="space-y-3">
                  <img
                    src={previewUrlRef.current || '/placeholder.svg'}
                    alt="Preview bukti pengambilan sepatu"
                    className="w-full h-32 object-cover rounded-lg shadow-sm"
                  />
                  <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Foto berhasil dipilih
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Upload foto bukti pengambilan sepatu
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG hingga 5MB</p>
                  </div>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCompletePickup)}>
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              field.onChange(event.target.files && event.target.files[0])
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons Section */}
        <div className="space-y-3 flex justify-between gap-5">
          <Button
            onClick={handleReleaseOrder}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm transition-all duration-200 bg-transparent"
          >
            <X className="h-4 w-4 mr-2" />
            Lepas Pesanan
          </Button>

          <Button
            type="submit"
            onClick={form.handleSubmit(handleCompletePickup)}
            disabled={
              form.formState.isSubmitting || !form.formState.isDirty || !form.formState.isValid
            }
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 shadow-sm transition-all duration-200"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Selesaikan Pengambilan
          </Button>
        </div>
      </div>
    </div>
  )
}
