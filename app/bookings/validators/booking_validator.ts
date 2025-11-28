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

export const shoe = vine.object({
  brand: vine.string(),
  size: vine.number(),
  type: vine.string(),
  material: vine.string(),
  category: vine.string(),
  condition: vine.string(),
  note: vine.string().optional(),
  services: vine.string(),
  additionalServices: vine.array(vine.string()).optional(),
})

export const inspectionSchema = vine.compile(shoe)

export type BookingPayload = {
  date: string
  addressId: string
}

export type InspectionPayload = Infer<typeof inspectionSchema>
