interface SharedErrors {
  validation_errors?: Record<string, string>
  general_errors?: string
  limiter_errors?: string
  [key: string]: unknown
}

export interface SharedData {
  auth: Auth
  errors?: SharedErrors
  [key: string]: unknown
}

export interface Auth {
  user: User
}

export interface User {
  id: number
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
  [key: string]: unknown
}

export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  street: string
  latitude: number
  longitude: number
  radius: number
  note: string
  [key: string]: unknown
}

export interface Booking {
  id: string
  number: string
  date: string
  createdAt: string
  address: Address
  status: BookingStatus[]
  service: ServiceItem[]
  photos: string[]
}

export interface ServiceItem {
  title: string
  attributes: string[]
  prices: PriceLine[]
}

type PriceLine = { label: string; amount: number }

export interface BookingStatus {
  id: string
  name: string
  note: string | null
  updatedAt: string
}

export interface PaginatedData<T> {
  data: T[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    firstPageUrl: string
    lastPageUrl: string
    nextPageUrl: string | null
    previousPageUrl: string | null
  }
}
