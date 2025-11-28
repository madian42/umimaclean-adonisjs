import { z } from 'zod'

const fileSizeLimit = 5 * 1024 * 1024

export const uploadClientPhotoSchema = z.object({
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif'].includes(file.type),
      { message: 'Tipe file tidak valid' }
    )
    .refine((file) => file.size <= fileSizeLimit, {
      message: 'Ukuran file tidak boleh melebihi 5MB',
    }),
})

export type UploadClientPhotoPayload = z.infer<typeof uploadClientPhotoSchema>
