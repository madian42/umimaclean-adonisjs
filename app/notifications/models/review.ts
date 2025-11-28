import BaseModel from '#common/models/base_model'
import TransactionItem from '#transactions/models/transaction_item'
import User from '#users/models/user'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare transactionItemId: string

  @column()
  declare rating: number

  @column()
  declare comment: string

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TransactionItem, {
    foreignKey: 'transactionItemId',
  })
  declare transactionItem: BelongsTo<typeof TransactionItem>
}
