import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Transaction from './transaction.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Service from '#bookings/models/service'
import Review from '#notifications/models/review'
import BaseModel from '#common/models/base_model'

export default class TransactionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare transactionId: string

  @column()
  declare serviceId: string

  @column()
  declare itemPrice: number

  @column()
  declare quantity: number

  @column()
  declare subtotal: number

  @belongsTo(() => Transaction, {
    foreignKey: 'transactionId',
  })
  declare transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Service, {
    foreignKey: 'serviceId',
  })
  declare service: BelongsTo<typeof Service>

  @hasMany(() => Review, {
    foreignKey: 'transactionItemId',
  })
  declare reviews: HasMany<typeof Review>
}
