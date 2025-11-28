import { Button } from '@/components/button'
import { Booking, PaginatedData } from '#core/types/type'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  bookings,
  handlePageChange,
  isLoading,
}: {
  bookings: PaginatedData<Booking>
  handlePageChange: (page: number) => void
  isLoading: boolean
}) {
  return (
    <div className="mt-6 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(bookings.meta.currentPage - 1)}
          disabled={bookings.meta.currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
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
                variant={bookings.meta.currentPage === pageNumber ? 'default' : 'outline'}
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
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
