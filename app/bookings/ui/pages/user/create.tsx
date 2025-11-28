import { useEffect } from 'react'
import { AlertCircle, Calendar, LoaderCircle, MapPin } from 'lucide-react'
import UserLayout from '@/components/layouts/user-layout'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/button'
import { Card, CardContent } from '@/components/card'
import { Alert, AlertDescription } from '@/components/alert'
import { Link, useRouter } from '@tuyau/inertia/react'
import { Calendar as CalendarComponent } from '@/components/calendar'
import { addDays, addMonths, format, isFriday, isSaturday, isThursday, isWednesday } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form'
import { BookingPayload, bookingSchema } from '#bookings/validators/booking_validator'
import { useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { toast } from 'sonner'

export default function Order({
  addressId,
  errors: serverErrors = {},
}: {
  addressId: string
  errors?: Record<string, any>
}) {
  const router = useRouter()

  const form = useForm<BookingPayload>({
    resolver: vineResolver(bookingSchema),
    defaultValues: {
      addressId,
      date: '',
    },
  })

  function getAvailableDates() {
    const dates = []
    const today = new Date()
    const oneMonthFromNow = addMonths(today, 1)

    for (let i = 0; i < 31; i++) {
      const checkDate = addDays(today, i)
      if (
        checkDate <= oneMonthFromNow &&
        (isWednesday(checkDate) ||
          isThursday(checkDate) ||
          isFriday(checkDate) ||
          isSaturday(checkDate))
      ) {
        dates.push(checkDate)
      }
    }
    return dates
  }

  const availableDates = getAvailableDates()

  async function onSubmit(data: BookingPayload) {
    router.visit(
      { route: 'bookings.store' },
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

  useEffect(() => {
    if (serverErrors.validation_errors && typeof serverErrors.validation_errors === 'object') {
      Object.entries(serverErrors.validation_errors).forEach(([field, message]) => {
        form.setError(field as keyof BookingPayload, {
          type: 'server',
          message: message as string,
        })
      })
    }
  }, [serverErrors, form])

  return (
    <UserLayout>
      <Head title="Order" />

      <div className="flex min-h-screen md:min-h-[calc(100vh-39px)] flex-col space-y-6 p-6">
        <div className="text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-bold">Jadwalkan Pesanan</h1>
          <p className="text-muted-foreground">Pilih tanggal untuk penjemputan sepatu Anda</p>
        </div>

        {!addressId && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-2">
                <span className="block text-base">
                  Anda belum menambahkan alamat. Silakan tambahkan alamat terlebih dahulu sebelum
                  membuat pesanan.
                </span>
                <Link route="profile.address">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-amber-300 bg-transparent cursor-pointer text-amber-700 hover:bg-amber-100"
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    Tambah Alamat
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="mx-auto w-full max-w-md">
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => {
                    const selectedDate = field.value ? new Date(field.value) : undefined
                    return (
                      <FormItem>
                        <FormLabel className="flex justify-center font-semibold text-xl">
                          Pilih Tanggal
                        </FormLabel>
                        <FormControl>
                          <CalendarComponent
                            className="w-full"
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => form.setValue('date', format(date!, 'yyyy-MM-dd'))}
                            disabled={(date) => {
                              if (!addressId) return true
                              return !availableDates.some(
                                (d) => d.toDateString() === date.toDateString()
                              )
                            }}
                            locale={id}
                          />
                        </FormControl>
                        <FormDescription>Tersedia hanya hari Rabu dan Sabtu</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <Button
                  type="submit"
                  className="w-full py-3 text-white cursor-pointer hover:bg-gray-700"
                  disabled={form.formState.isSubmitting || !addressId}
                >
                  {form.formState.isSubmitting && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Konfirmasi Pemesanan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  )
}
