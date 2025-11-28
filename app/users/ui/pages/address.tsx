import { Address } from '#core/types/type'
import { AlertTriangle, Edit, X } from 'lucide-react'
import ProfileLayout from '../components/profile-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { useRouter } from '@tuyau/inertia/react'
import { AddressPayload, addressSchema } from '#users/validators/address_validator'
import { useEffect, useState } from 'react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form'
import { Input } from '@/components/input'
import { Spinner } from '@/components/spinner'
import L, { LatLng } from 'leaflet'
import MapComponent from '../components/map'
import StaticMap from '../components/static-map'
import { Textarea } from '@/components/textarea'
import { useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { toast } from 'sonner'

export default function AddressPage({
  address,
  errors: serverErrors = {},
}: {
  address: Address
  errors?: Record<string, string>
}) {
  const router = useRouter()

  const [isEditMode, setIsEditMode] = useState<boolean>(!address?.name) // Auto-enable edit mode if no address exists

  const defaultPosition = L.latLng(-6.9555305, 107.6540353)
  const [mapPosition, setMapPosition] = useState<LatLng>(
    address?.latitude && address?.longitude
      ? L.latLng(address.latitude, address.longitude)
      : defaultPosition
  )

  const form = useForm<AddressPayload>({
    resolver: vineResolver(addressSchema),
    defaultValues: {
      name: address?.name || '',
      phone: address?.phone || '',
      street: address?.street || '',
      latitude: address?.latitude || mapPosition.lat,
      longitude: address?.longitude || mapPosition.lng,
      radius: address?.radius || 0,
      note: address?.note || '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (serverErrors.validation_errors && typeof serverErrors.validation_errors === 'object') {
      Object.entries(serverErrors.validation_errors).forEach(([field, message]) => {
        form.setError(field as keyof AddressPayload, {
          type: 'server',
          message: message as string,
        })
      })
    }
  }, [serverErrors, form])

  function handleCancelEdit() {
    form.reset()
    setIsEditMode(false)
    if (address?.latitude && address?.longitude) {
      setMapPosition(L.latLng(address.latitude, address.longitude))
    }
  }

  async function onSubmit(data: AddressPayload) {
    router.visit(
      { route: 'profile.address.handle' },
      {
        method: 'post',
        data,
        fresh: true,
        onSuccess: () => {
          form.reset()
          toast.success('Berhasil daftar!')
        },
        onError: (errors) => {
          if (errors?.general_errors) {
            toast.error(errors.general_errors)
          }
        },
      }
    )
  }

  return (
    <ProfileLayout>
      <div className="flex flex-col gap-4">
        {form.formState.isDirty && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Anda memiliki perubahan yang belum disimpan
            </span>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informasi Alamat</CardTitle>
              {!isEditMode && address?.name && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              {isEditMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Batal
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            autoComplete="name"
                            autoFocus
                            tabIndex={isEditMode ? 1 : -1}
                            disabled={!isEditMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Masukkan nomor telepon"
                            autoComplete="tel"
                            tabIndex={isEditMode ? 2 : -1}
                            disabled={!isEditMode}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Masukkan nomor telepon dengan format 08xxxxxxxxxx (tanpa +62)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Jalan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan alamat lengkap"
                            autoComplete="street-address"
                            tabIndex={isEditMode ? 3 : -1}
                            disabled={!isEditMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Masukkan catatan (opsional)"
                            tabIndex={isEditMode ? 4 : -1}
                            disabled={!isEditMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field: latField }) => (
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field: lngField }) => (
                          <FormField
                            control={form.control}
                            name="radius"
                            render={({ field: radiusField }) => (
                              <FormItem>
                                <FormLabel>Koordinat Lokasi</FormLabel>
                                <FormControl>
                                  {isEditMode ? (
                                    <div className="overflow-hidden rounded-lg border border-border">
                                      <MapComponent
                                        position={
                                          new L.LatLng(
                                            latField.value || defaultPosition.lat,
                                            lngField.value || defaultPosition.lng
                                          )
                                        }
                                        onPositionChange={(position: LatLng) => {
                                          latField.onChange(position.lat)
                                          lngField.onChange(position.lng)
                                        }}
                                        onRadiusChange={(radius) => {
                                          radiusField.onChange(Math.round(radius * 100) / 100)
                                        }}
                                        disableAutoLocation={!!address?.latitude}
                                      />
                                    </div>
                                  ) : (
                                    address?.latitude &&
                                    address?.longitude && (
                                      <div className="overflow-hidden rounded-lg border border-border">
                                        <StaticMap
                                          latitude={address.latitude}
                                          longitude={address.longitude}
                                        />
                                      </div>
                                    )
                                  )}
                                </FormControl>
                                <FormMessage>
                                  {form.formState.errors.latitude && (
                                    <p className="text-sm font-medium text-destructive">
                                      {form.formState.errors.latitude.message}
                                    </p>
                                  )}
                                  {form.formState.errors.longitude && (
                                    <p className="text-sm font-medium text-destructive">
                                      {form.formState.errors.longitude.message}
                                    </p>
                                  )}
                                  {form.formState.errors.radius && (
                                    <p className="text-sm font-medium text-destructive">
                                      {form.formState.errors.radius.message}
                                    </p>
                                  )}
                                </FormMessage>
                              </FormItem>
                            )}
                          />
                        )}
                      />
                    )}
                  />

                  {isEditMode && (
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      tabIndex={5}
                      disabled={form.formState.isSubmitting || !form.formState.isDirty}
                    >
                      {form.formState.isSubmitting && <Spinner />}
                      Simpan Perubahan
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  )
}
