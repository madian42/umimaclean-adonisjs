import { useState } from 'react'
import { Package, Camera, Truck, Shield, Search } from 'lucide-react'
import { router } from '@inertiajs/react'
import { Booking, Filters, PaginatedData } from '#core/types/type'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { tuyau } from '#core/ui/app/tuyau'
import StaffLayout from '@/components/layouts/staff-layout'
import BookingStatuses from '#core/enums/booking_status_enum'
import { Input } from '@/components/input'
import Pagination from '#bookings/ui/components/pagination'
import StaffBookingTabs from '#bookings/ui/components/staff-booking-tabs'

export default function StaffDashboard({
  bookings,
  filters,
}: {
  bookings: PaginatedData<Booking>
  filters: Filters
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search)
  const [statusFilter, setStatusFilter] = useState(filters.status || 'today')
  const [isLoading, setIsLoading] = useState(false)

  console.log('bookings', bookings)
  const todayBookings = bookings.data.filter((b) => {
    const name = b.statuses?.[0]?.name
    return name !== BookingStatuses.PICKUP_PROGRESS && name !== BookingStatuses.DELIVERY
  })
  const activeBookings = bookings.data.filter((b) => {
    const name = b.statuses?.[0]?.name
    return name === BookingStatuses.PICKUP_PROGRESS || name === BookingStatuses.DELIVERY
  })

  function handleSearch(search: string) {
    setIsLoading(true)
    const url = tuyau.$url('staff.dashboard', {
      query: { search, status: statusFilter, page: 1 },
    })
    router.get(url, {}, { onFinish: () => setIsLoading(false) })
  }

  async function handleStatusFilter(status: string) {
    setIsLoading(true)
    setStatusFilter(status)
    const url = tuyau.$url('staff.dashboard', {
      query: { search: searchTerm, status, page: 1 },
    })
    router.get(url, {}, { onFinish: () => setIsLoading(false) })
  }

  function handlePageChange(page: number) {
    setIsLoading(true)
    const url = tuyau.$url('staff.dashboard', {
      query: { search: searchTerm, status: statusFilter, page },
    })
    router.get(url, {}, { onFinish: () => setIsLoading(false) })
  }

  return (
    <StaffLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          </div>

          <div className="mb-6 space-y-4">
            {/* Search and Filter Section */}
            <div className="flex gap-4 flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nomor booking, nama, telepon, atau alamat..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchTerm)
                    }
                  }}
                />
              </div>
              <Button
                className="cursor-pointer"
                onClick={() => handleSearch(searchTerm)}
                disabled={isLoading}
              >
                Cari
              </Button>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={statusFilter} onValueChange={handleStatusFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="today">Tugas Hari Ini</TabsTrigger>
                <TabsTrigger value="active">Dalam Proses</TabsTrigger>
              </TabsList>

              {/* Tabs Content */}
              <TabsContent value={statusFilter} className="pb-10">
                <StaffBookingTabs
                  isLoading={isLoading}
                  isSearch={searchTerm.length > 0}
                  items={statusFilter === 'today' ? todayBookings : activeBookings}
                />

                {/* Pagination */}
                {bookings.meta.lastPage > 1 && (
                  <Pagination
                    bookings={bookings}
                    handlePageChange={handlePageChange}
                    isLoading={isLoading}
                  />
                )}
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card className="mt-6 gap-0">
              <CardHeader>
                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button className="h-12 bg-orange-600 hover:bg-orange-700">
                  <Truck className="w-4 h-4 mr-2" />
                  Pickup Baru
                </Button>
                <Button variant="outline" className="h-12 bg-transparent">
                  <Camera className="w-4 h-4 mr-2" />
                  Assessment
                </Button>
                <Button variant="outline" className="h-12 bg-transparent">
                  <Package className="w-4 h-4 mr-2" />
                  Delivery
                </Button>
                <Button variant="outline" className="h-12 bg-transparent">
                  <Shield className="w-4 h-4 mr-2" />
                  Foto Bukti
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
