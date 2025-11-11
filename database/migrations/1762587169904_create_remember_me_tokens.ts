import Tables from '#core/enums/table_enum'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.REMEMBER_ME_TOKENS

  async up() {
    this.schema.createTable(Tables.REMEMBER_ME_TOKENS, (table) => {
      table.increments()
      table
        .uuid('tokenable_id')
        .notNullable()
        .references('id')
        .inTable(Tables.USERS)
        .onDelete('CASCADE')
      table.string('hash').notNullable().unique()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
