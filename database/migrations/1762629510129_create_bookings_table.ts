import BookingPhotoStage from '#core/enums/booking_photo_stage_enum'
import BookingStatuses from '#core/enums/booking_status_enum'
import Tables from '#core/enums/table_enum'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable(Tables.BOOKINGS, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.string('number').notNullable().unique()
      table.uuid('user_id').notNullable().references('id').inTable(Tables.USERS).onDelete('CASCADE')
      table
        .uuid('address_id')
        .notNullable()
        .references('id')
        .inTable(Tables.ADDRESSES)
        .onDelete('CASCADE')
      table.date('date').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.createTable(Tables.BOOKING_STATUSES, (table) => {
      table.increments('id')
      table
        .uuid('booking_id')
        .notNullable()
        .references('id')
        .inTable(Tables.BOOKINGS)
        .onDelete('CASCADE')
      table
        .enum('name', Object.values(BookingStatuses))
        .notNullable()
        .defaultTo(BookingStatuses.WAITING_DEPOSIT)
      table.text('note').nullable()

      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.createTable(Tables.BOOKING_PHOTOS, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table
        .uuid('booking_id')
        .notNullable()
        .references('id')
        .inTable(Tables.BOOKINGS)
        .onDelete('CASCADE')
      table
        .uuid('admin_id')
        .notNullable()
        .references('id')
        .inTable(Tables.USERS)
        .onDelete('CASCADE')
      table.enum('stage', Object.values(BookingPhotoStage)).notNullable()
      table.text('path').notNullable()
      table.text('note').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(Tables.BOOKINGS)
    this.schema.dropTable(Tables.BOOKING_STATUSES)
    this.schema.dropTable(Tables.BOOKING_PHOTOS)
  }
}
