import Tables from '#core/enums/table_enum'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable(Tables.SHOES, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table
        .uuid('booking_id')
        .notNullable()
        .references('id')
        .inTable(Tables.BOOKINGS)
        .onDelete('CASCADE')
      table.string('brand').notNullable()
      table.integer('size').notNullable()
      table.string('type').notNullable()
      table.string('material').notNullable()
      table.string('category').notNullable()
      table.string('condition').notNullable()
      table.string('note').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.createTable(Tables.SERVICES, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.string('name').notNullable()
      table.text('description').nullable()
      table.decimal('price', 8, 2).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(Tables.SHOES)
    this.schema.dropTable(Tables.SERVICES)
  }
}
