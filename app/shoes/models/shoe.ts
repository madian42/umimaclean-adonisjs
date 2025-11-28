import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tables from '#core/enums/table_enum'
import Booking from '#bookings/models/booking'
import BaseModel from '#common/models/base_model'
import TransactionItem from '#transactions/models/transaction_item'

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

  @belongsTo(() => Booking, {
    foreignKey: 'bookingId',
  })
  declare booking: BelongsTo<typeof Booking>

  @hasMany(() => TransactionItem, {
    foreignKey: 'shoeId',
  })
  declare transactionItem: HasMany<typeof TransactionItem>
}
