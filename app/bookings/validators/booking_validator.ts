import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = {
  required: '{{ field }} harus diisi',
  string: '{{ field }} harus berupa teks',
  uuid: '{{ field }} harus berupa UUID yang valid',
  date: '{{ field }} harus berupa tanggal yang valid',
}

const fields = {
  addressId: 'ID Alamat',
  date: 'Tanggal',
  time: 'Waktu',
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)

export const bookingSchema = vine.compile(
  vine.object({
    addressId: vine.string().uuid(),
    date: vine.string().transform((valuew) => new Date(valuew)),
    time: vine.string(),
  })
)

export type BookingPayload = {
  time: string
  date: string
  addressId: string
}
