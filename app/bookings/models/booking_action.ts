import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Booking from './booking.js'
import User from '#users/models/user'
import Tables from '#core/enums/table_enum'
import { DateTime } from 'luxon'
import BookingPhoto from './booking_photo.js'
import BookingActions from '#core/enums/booking_action_enum'

export default class BookingAction extends BaseModel {
  static table = Tables.BOOKING_ACTIONS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare bookingId: string

  @column()
  declare bookingPhotoId: string | null

  @column()
  declare adminId: string

  @column()
  declare action: BookingActions

  @column()
  declare note: string | null

  @column.dateTime()
  declare createdAt: DateTime

  @hasOne(() => BookingPhoto, {
    foreignKey: 'bookingPhotoId',
  })
  declare photo: HasOne<typeof BookingPhoto>

  @belongsTo(() => Booking, {
    foreignKey: 'bookingId',
  })
  declare booking: BelongsTo<typeof Booking>

  @belongsTo(() => User, {
    foreignKey: 'adminId',
  })
  declare admin: BelongsTo<typeof User>
}
