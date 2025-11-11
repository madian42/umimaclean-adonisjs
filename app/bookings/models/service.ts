import BaseModel from '#common/models/base_model'
import Tables from '#core/enums/table_enum'
import Transaction from '#transactions/models/transaction'
import { column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

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

  @manyToMany(() => Transaction, {
    pivotTable: 'transaction_services',
    pivotColumns: ['price', 'quantity'],
  })
  declare transactions: ManyToMany<typeof Transaction>
}
