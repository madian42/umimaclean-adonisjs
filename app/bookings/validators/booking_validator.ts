import BookingPhotoStage from '#core/enums/booking_photo_stage_enum'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

const messages = {
  'required': '{{ field }} harus diisi',
  'string': '{{ field }} harus berupa teks',
  'uuid': '{{ field }} harus berupa UUID yang valid',
  'date': '{{ field }} harus berupa tanggal yang valid',
  'enum': '{{ field }} harus berupa salah satu dari nilai yang diizinkan',
  'image.size': '{{ field }} harus berukuran maksimal {{ options.size }}',
  'image.extnames':
    '{{ field }} harus berupa salah satu dari ekstensi yang diizinkan: {{ options.extnames }}',
}

const fields = {
  addressId: 'ID Alamat',
  date: 'Tanggal',
  stage: 'Tahap',
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)

export const bookingSchema = vine.compile(
  vine.object({
    addressId: vine.string().uuid(),
    date: vine.string().transform((valuew) => new Date(valuew)),
  })
)

export const releaseShipModeSchema = vine.compile(
  vine.object({
    stage: vine.enum(BookingPhotoStage),
  })
)

export type BookingPayload = {
  date: string
  addressId: string
}

export type ReleaseShipModePayload = Infer<typeof releaseShipModeSchema>
