import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Booking from './booking.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import BookingStatuses from '#core/enums/booking_status_enum'
import Tables from '#core/enums/table_enum'

export default class BookingStatus extends BaseModel {
  static table = Tables.BOOKING_STATUSES

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare bookingId: string

  @column()
  declare name: BookingStatuses

  @column()
  declare note: string | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Booking, {
    foreignKey: 'bookingId',
  })
  declare booking: BelongsTo<typeof Booking>
}
