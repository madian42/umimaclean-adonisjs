import UserLayout from '#common/ui/components/user-layout'
import { Head, router } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, ClipboardList, Search } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs'
import { tuyau } from '#core/ui/app/tuyau'
import BookingTabs from '#bookings/ui/components/booking-tabs'
import { PaginatedData, Booking } from '#core/types/type'

interface Filters {
  search: string
  status: string
  page: number
  limit: number
}

export default function History({
  bookings,
  filters,
}: {
  bookings: PaginatedData<Booking>
  filters: Filters
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search)
  const [statusFilter, setStatusFilter] = useState(filters.status || 'active')
  const [isLoading, setIsLoading] = useState(false)

  const activeBookings = bookings.data.filter((b) => {
    const name = b.status?.[0]?.name
    return name !== 'completed' && name !== 'cancelled'
  })
  const completedBookings = bookings.data.filter((b) => {
    const name = b.status?.[0]?.name
    return name === 'completed' || name === 'cancelled'
  })

  function handleSearch(search: string) {
    setIsLoading(true)
    const url = tuyau.$url('bookings.index', {
      query: { search, status: statusFilter, page: 1, limit: 10 },
    })
    router.get(url, {}, { onFinish: () => setIsLoading(false) })
  }

  async function handleStatusFilter(status: string) {
    setIsLoading(true)
    setStatusFilter(status)
    const url = tuyau.$url('bookings.index', {
      query: { search: searchTerm, status, page: 1, limit: 10 },
    })
    router.get(url, {}, { onFinish: () => setIsLoading(false) })
  }

  function handlePageChange(page: number) {
    setIsLoading(true)
    const url = tuyau.$url('bookings.index', {
      query: { search: searchTerm, status: statusFilter, page, limit: 10 },
    })
    router.get(url, {}, { onFinish: () => setIsLoading(false) })
  }

  return (
    <UserLayout>
      <Head title="Riwayat Pesanan" />

      <div className="flex min-h-screen md:min-h-[calc(100vh-39px)] flex-col p-6">
        <div className="mb-6 text-center">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-bold">Daftar Booking</h1>
          <p className="text-muted-foreground">Kelola semua jadwal booking Anda</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
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

          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={handleStatusFilter} className="w-full">
            <TabsList className="w-full h-10">
              <TabsTrigger value="active" className="text-xs">
                Sedang Berjalan
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                Selesai
              </TabsTrigger>
            </TabsList>

            {/* Active Tab Content */}
            <TabsContent value="active">
              <BookingTabs
                isLoading={isLoading}
                isSearch={filters.search.length > 0}
                items={activeBookings}
              />

              {/* Pagination */}
              {bookings.meta.lastPage > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {(bookings.meta.currentPage - 1) * bookings.meta.perPage + 1} -{' '}
                    {Math.min(
                      bookings.meta.currentPage * bookings.meta.perPage,
                      bookings.meta.total
                    )}{' '}
                    dari {bookings.meta.total} hasil
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(bookings.meta.currentPage - 1)}
                      disabled={bookings.meta.currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, bookings.meta.lastPage) }, (_, i) => {
                        let pageNumber: number
                        if (bookings.meta.lastPage <= 5) {
                          pageNumber = i + 1
                        } else if (bookings.meta.currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (bookings.meta.currentPage >= bookings.meta.lastPage - 2) {
                          pageNumber = bookings.meta.lastPage - 4 + i
                        } else {
                          pageNumber = bookings.meta.currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={
                              bookings.meta.currentPage === pageNumber ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(bookings.meta.currentPage + 1)}
                      disabled={bookings.meta.currentPage === bookings.meta.lastPage || isLoading}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Completed Tab Content (includes 'cancelled') */}
            <TabsContent value="completed">
              <BookingTabs
                isLoading={isLoading}
                isSearch={filters.search.length > 0}
                items={completedBookings}
              />

              {/* Pagination */}
              {bookings.meta.lastPage > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {(bookings.meta.currentPage - 1) * bookings.meta.perPage + 1} -{' '}
                    {Math.min(
                      bookings.meta.currentPage * bookings.meta.perPage,
                      bookings.meta.total
                    )}{' '}
                    dari {bookings.meta.total} hasil
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(bookings.meta.currentPage - 1)}
                      disabled={bookings.meta.currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, bookings.meta.lastPage) }, (_, i) => {
                        let pageNumber: number
                        if (bookings.meta.lastPage <= 5) {
                          pageNumber = i + 1
                        } else if (bookings.meta.currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (bookings.meta.currentPage >= bookings.meta.lastPage - 2) {
                          pageNumber = bookings.meta.lastPage - 4 + i
                        } else {
                          pageNumber = bookings.meta.currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={
                              bookings.meta.currentPage === pageNumber ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(bookings.meta.currentPage + 1)}
                      disabled={bookings.meta.currentPage === bookings.meta.lastPage || isLoading}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </UserLayout>
  )
}
