import { belongsTo, column } from '@adonisjs/lucid/orm'
import Transaction from './transaction.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import BaseModel from '#common/models/base_model'
import Shoe from '#shoes/models/shoe'
import Service from './service.js'

export default class TransactionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare transactionId: string

  @column()
  declare shoeId: string

  @column()
  declare serviceId: string

  @column()
  declare itemPrice: number

  @column()
  declare subtotal: number

  @belongsTo(() => Transaction, {
    foreignKey: 'transactionId',
  })
  declare transaction: BelongsTo<typeof Transaction>

  @belongsTo(() => Shoe, {
    foreignKey: 'shoeId',
  })
  declare shoe: BelongsTo<typeof Shoe>

  @belongsTo(() => Service, {
    foreignKey: 'serviceId',
  })
  declare service: BelongsTo<typeof Service>
}
