import { beforeCreate, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#users/models/user'
import Tables from '#core/enums/table_enum'
import Transaction from '#transactions/models/transaction'
import Shoe from '#shoes/models/shoe'
import BookingPhoto from './booking_photo.js'
import BookingStatus from './booking_status.js'
import BaseModel from '#common/models/base_model'
import Address from '#users/models/address'

export default class Booking extends BaseModel {
  static table = Tables.BOOKINGS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare number: string

  @column()
  declare userId: string

  @column()
  declare addressId: string

  @column()
  declare date: Date

  // in case needed later
  // @column()
  // declare time: string

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Address, {
    foreignKey: 'addressId',
  })
  declare address: BelongsTo<typeof Address>

  @hasOne(() => Transaction, {
    foreignKey: 'bookingId',
  })
  declare transaction: HasOne<typeof Transaction>

  @hasMany(() => Shoe, {
    foreignKey: 'bookingId',
  })
  declare shoe: HasMany<typeof Shoe>

  @hasMany(() => BookingPhoto, {
    foreignKey: 'bookingId',
  })
  declare photos: HasMany<typeof BookingPhoto>

  @hasMany(() => BookingStatus, {
    foreignKey: 'bookingId',
  })
  declare status: HasMany<typeof BookingStatus>

  @beforeCreate()
  static async generateNumber(booking: Booking) {
    booking.number = await this.generateBookingNumber()
  }

  /**
   * Generate unique booking number with format ORD{YY}{MM}-{NNNN}
   */
  private static async generateBookingNumber() {
    const { day, year, month } = this.getCurrentYearMonth()
    const prefix = `ORD${year}${month}${day}`
    const lastBooking = await this.getLastBookingForMonth(prefix)
    const nextIncrement = this.calculateNextIncrement(lastBooking)
    const identifier = this.formatIdentifier(nextIncrement)

    return `${prefix}-${identifier}`
  }

  /**
   * Get current year and month formatted
   */
  private static getCurrentYearMonth() {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const year = today.getFullYear().toString().slice(-2) // Last 2 digits
    const month = (today.getMonth() + 1).toString().padStart(2, '0') // Zero-padded month

    return { year, month, day }
  }

  /**
   * Find the last booking for current month and year
   */
  private static async getLastBookingForMonth(prefix: string) {
    return await Booking.query()
      .where('number', 'like', `${prefix}-%`)
      .orderBy('number', 'desc')
      .first()
  }

  /**
   * Calculate next increment number
   */
  private static calculateNextIncrement(lastBooking: Booking | null) {
    if (!lastBooking) return 1

    const lastNumber = lastBooking.number.split('-')[1]
    return Number.parseInt(lastNumber) + 1
  }

  /**
   * Format increment as 4-digit identifier
   */
  private static formatIdentifier(increment: number) {
    return increment.toString().padStart(3, '0')
  }
}
