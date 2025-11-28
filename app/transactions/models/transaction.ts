import Booking from '#bookings/models/booking'
import BaseModel from '#common/models/base_model'
import Tables from '#core/enums/table_enum'
import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import TransactionItem from './transaction_item.js'

export default class Transaction extends BaseModel {
  static table = Tables.TRANSACTIONS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare bookingId: string

  @column()
  declare status: string

  @column()
  declare type: 'down_payment' | 'full_payment'

  @column()
  declare amount: number

  @column()
  declare midtransStatus: string

  @column()
  declare midtransId: string

  @column.dateTime()
  declare paymentAt: DateTime | null

  @belongsTo(() => Booking, {
    foreignKey: 'bookingId',
  })
  declare booking: BelongsTo<typeof Booking>

  @hasMany(() => TransactionItem, {
    foreignKey: 'transactionId',
  })
  declare items: HasMany<typeof TransactionItem>
}
