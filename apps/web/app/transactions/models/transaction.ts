import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import TransactionItem from './transaction_item.js'
import Tables from '#core/enums/table_enum'
import Booking from '#bookings/models/booking'
import User from '#users/models/user'
import BaseModel from '#common/models/base_model'
import { DateTime } from 'luxon'

export default class Transaction extends BaseModel {
  static table = Tables.TRANSACTIONS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare bookingId: string

  @column()
  declare status: string

  @column()
  declare downPayment: number

  @column()
  declare fullPayment: number | null

  @column()
  declare midtransDownPaymentStatus: string

  @column()
  declare midtransFullPaymentStatus: string

  @column()
  declare midtransDownPaymentId: string

  @column()
  declare midtransFullPaymentId: string | null

  @column.dateTime()
  declare downPaymentAt: DateTime | null

  @column.dateTime()
  declare fullPaymentAt: DateTime | null

  @belongsTo(() => Booking, {
    foreignKey: 'bookingId',
  })
  declare booking: BelongsTo<typeof Booking>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @hasMany(() => TransactionItem, {
    foreignKey: 'transactionId',
  })
  declare items: HasMany<typeof TransactionItem>
}
