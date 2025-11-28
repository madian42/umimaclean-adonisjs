import User from '#users/models/user'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare type: string

  @column()
  declare title: string

  @column()
  declare message: string

  @column()
  declare isRead: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
}
