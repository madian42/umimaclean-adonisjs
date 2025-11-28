import Tables from '#core/enums/table_enum'
import TransactionStatuses from '#core/enums/transaction_status_enum'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable(Tables.TRANSACTIONS, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table
        .uuid('booking_id')
        .notNullable()
        .references('id')
        .inTable(Tables.BOOKINGS)
        .onDelete('CASCADE')
      table
        .enum('status', Object.values(TransactionStatuses))
        .notNullable()
        .defaultTo(TransactionStatuses.PENDING)
      table.enum('type', ['down_payment', 'full_payment']).notNullable()
      table.decimal('amount', 10, 2).notNullable()
      table.string('midtrans_status', 32).notNullable()
      table.uuid('midtrans_id').notNullable()

      table.timestamp('payment_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.createTable(Tables.TRANSACTION_ITEMS, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table
        .uuid('transaction_id')
        .notNullable()
        .references('id')
        .inTable(Tables.TRANSACTIONS)
        .onDelete('CASCADE')
      table.uuid('shoe_id').notNullable().references('id').inTable(Tables.SHOES).onDelete('CASCADE')
      table
        .uuid('service_id')
        .notNullable()
        .references('id')
        .inTable(Tables.SERVICES)
        .onDelete('CASCADE')
      table.decimal('item_price', 10, 2).notNullable()
      table.decimal('subtotal', 10, 2).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(Tables.TRANSACTIONS)
    this.schema.dropTable(Tables.TRANSACTION_ITEMS)
  }
}
