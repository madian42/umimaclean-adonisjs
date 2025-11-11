import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, CalendarDays, Clock, LoaderCircle, MapPin } from 'lucide-react'
import UserLayout from '#common/ui/components/user-layout'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card'
import { Alert, AlertDescription } from '@/components/alert'
import { Link, useRouter } from '@tuyau/inertia/react'
import { Calendar as CalendarComponent } from '@/components/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover'
import { addDays, addMonths, format, getHours, isSaturday, isToday, isWednesday } from 'date-fns'
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
import { cn } from '@/lib/utils'
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

  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)

  const form = useForm<BookingPayload>({
    resolver: vineResolver(bookingSchema),
    defaultValues: {
      addressId,
      date: '',
      time: '',
    },
  })

  function getAvailableDates() {
    const dates = []
    const today = new Date()
    const oneMonthFromNow = addMonths(today, 1)

    for (let i = 0; i < 31; i++) {
      const checkDate = addDays(today, i)
      if (checkDate <= oneMonthFromNow && (isWednesday(checkDate) || isSaturday(checkDate))) {
        dates.push(checkDate)
      }
    }
    return dates
  }

  const availableDates = getAvailableDates()

  function isTimeSlotDisabled(timeSlot: string, date?: Date) {
    if (!date) return false

    const currentHour = getHours(new Date())

    if (isToday(date) && currentHour >= 15) return true

    if (isToday(date) && timeSlot === 'siang' && currentHour >= 10) return true

    if (isToday(date) && timeSlot === 'sore' && currentHour >= 13) return true

    if (!addressId) return true

    return false
  }

  const timeSlots = [
    { id: 'siang', label: 'Siang (10:00 - 13:00)', value: 'siang' },
    { id: 'sore', label: 'Sore (13:00 - 15:00)', value: 'sore' },
  ]

  function handleDateSelect(date: Date | undefined) {
    if (!addressId) return

    if (date && availableDates.some((d) => d.toDateString() === date.toDateString())) {
      form.setValue('date', format(date, 'yyyy-MM-dd'))
      form.setValue('time', '')
      setIsCalendarOpen(false)
    }
  }

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
          <CardHeader>
            <CardTitle className="text-lg">Pilih Tanggal</CardTitle>
          </CardHeader>
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
                        <FormLabel>Pilih Tanggal</FormLabel>
                        <FormControl>
                          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={!addressId}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !selectedDate && 'text-muted-foreground',
                                  !addressId && 'cursor-not-allowed opacity-50'
                                )}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {selectedDate
                                  ? format(selectedDate, 'dd/MM/yyyy', { locale: id })
                                  : 'Pilih Tanggal'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                              <CalendarComponent
                                className="w-full"
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => handleDateSelect(date)}
                                disabled={(date) => {
                                  if (!addressId) return true
                                  return !availableDates.some(
                                    (d) => d.toDateString() === date.toDateString()
                                  )
                                }}
                                locale={id}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormDescription>Tersedia hanya hari Rabu dan Sabtu</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => {
                    const selectedDate = form.watch('date')
                      ? new Date(form.watch('date'))
                      : undefined
                    return (
                      <FormItem>
                        <FormLabel>Pilih Waktu</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 gap-3">
                            {timeSlots.map((slot) => {
                              const isDisabled = isTimeSlotDisabled(slot.value, selectedDate)
                              return (
                                <Button
                                  key={slot.id}
                                  type="button"
                                  variant={field.value === slot.value ? 'default' : 'outline'}
                                  className={cn(
                                    'h-auto w-full justify-start py-3',
                                    isDisabled && 'cursor-not-allowed opacity-50'
                                  )}
                                  onClick={() =>
                                    !isDisabled && addressId && field.onChange(slot.value)
                                  }
                                  disabled={isDisabled}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  {slot.label}
                                  {isDisabled && selectedDate && isToday(selectedDate) && (
                                    <span className="ml-auto text-xs text-red-500">
                                      Tidak tersedia
                                    </span>
                                  )}
                                </Button>
                              )
                            })}
                          </div>
                        </FormControl>
                        {selectedDate && isToday(selectedDate) && (
                          <FormDescription className="text-amber-600">
                            Slot waktu yang sudah terlewat tidak dapat dipilih
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <Button
                  type="submit"
                  className="w-full bg-gray-600 py-3 text-white cursor-pointer hover:bg-gray-700"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty || !addressId}
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
