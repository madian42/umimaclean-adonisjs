import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Booking from './booking.js'
import BookingPhotoStage from '#core/enums/booking_photo_stage_enum'
import User from '#users/models/user'
import Tables from '#core/enums/table_enum'
import { DateTime } from 'luxon'

export default class BookingPhoto extends BaseModel {
  static table = Tables.BOOKING_PHOTOS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare bookingId: string

  @column()
  declare adminId: string

  @column()
  declare stage: BookingPhotoStage

  @column()
  declare path: string

  @column()
  declare note: string | null

  @column.dateTime({ autoCreate: true })
  declare uploadedAt: DateTime

  @belongsTo(() => Booking, {
    foreignKey: 'bookingId',
  })
  declare booking: BelongsTo<typeof Booking>

  @belongsTo(() => User, {
    foreignKey: 'adminId',
  })
  declare admin: BelongsTo<typeof User>
}
