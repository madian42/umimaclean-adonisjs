import BaseModel from '#common/models/base_model'
import Tables from '#core/enums/table_enum'
import { column, hasMany } from '@adonisjs/lucid/orm'
import TransactionItem from '#transactions/models/transaction_item'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Service extends BaseModel {
  static table = Tables.SERVICES

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare price: number

  @column()
  declare type: 'primary' | 'additional' | 'start_from'

  @hasMany(() => TransactionItem, {
    foreignKey: 'serviceId',
  })
  declare transactionItems: HasMany<typeof TransactionItem>
}
