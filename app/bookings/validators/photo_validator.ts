import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = {
  'image.size': '{{ field }} harus berukuran maksimal {{ options.size }}',
  'image.extnames':
    '{{ field }} harus berupa salah satu dari ekstensi yang diizinkan: {{ options.extnames }}',
}

const fields = {
  image: 'Foto',
}

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)

export const uploadPhotoSchema = vine.compile(
  vine.object({
    image: vine.file({
      size: '5mb',
      extnames: ['png', 'jpg', 'jpeg'],
    }),
  })
)
