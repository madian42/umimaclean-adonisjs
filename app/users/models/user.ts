import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { computed, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import BaseModel from '#common/models/base_model'
import Roles from '#users/enums/role_enum'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import Booking from '#bookings/models/booking'
import Review from '#notifications/models/review'
import Notification from '#notifications/models/notification'
import ResetPasswordToken from './reset_password_token.js'
import Address from './address.js'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare roleId: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string | null

  @computed()
  get isAdmin() {
    return this.roleId === Roles.ADMIN
  }

  @computed()
  get isStaff() {
    return this.roleId === Roles.STAFF
  }

  @computed()
  get isUser() {
    return this.roleId === Roles.USER
  }

  @belongsTo(() => Role, {
    foreignKey: 'roleId',
  })
  declare role: BelongsTo<typeof Role>

  @hasMany(() => ResetPasswordToken, {
    foreignKey: 'userId',
  })
  declare resetPasswordTokens: HasMany<typeof ResetPasswordToken>

  @hasOne(() => Address, {
    foreignKey: 'userId',
  })
  declare address: HasOne<typeof Address>

  @hasMany(() => Booking, {
    foreignKey: 'userId',
  })
  declare bookings: HasMany<typeof Booking>

  @hasMany(() => Review, {
    foreignKey: 'userId',
  })
  declare reviews: HasMany<typeof Review>

  @hasMany(() => Notification, {
    foreignKey: 'userId',
  })
  declare notifications: HasMany<typeof Notification>

  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)
}
