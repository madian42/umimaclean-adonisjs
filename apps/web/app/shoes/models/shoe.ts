import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tables from '#core/enums/table_enum'
import Booking from '#bookings/models/booking'
import BaseModel from '#common/models/base_model'

export default class Shoe extends BaseModel {
  static table = Tables.SHOES

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare bookingId: string

  @column()
  declare brand: string

  @column()
  declare size: number

  @column()
  declare type: string

  @column()
  declare material: string

  @column()
  declare category: string

  @column()
  declare condition: string

  @column()
  declare note: string | null

  @belongsTo(() => Booking, {
    foreignKey: 'bookingId',
  })
  declare booking: BelongsTo<typeof Booking>
}
