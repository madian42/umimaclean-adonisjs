import { FieldContext } from '@vinejs/vine/types'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'

/**
 * Database uniqueness validation that prevents duplicate entries
 * while maintaining data integrity across user registrations
 */

type Options = {
  table: string
  column: string
  label?: string
}

async function unique(value: unknown, options: Options, field: FieldContext) {
  if (typeof value !== 'string') {
    return
  }

  const row = await db
    .from(options.table)
    .select(options.column)
    .where(options.column, value)
    .first()

  if (row) {
    const explicitLabel = options.label
    const fieldLabel = (field as any)?.label ?? (field as any)?.name
    const label = explicitLabel ?? fieldLabel ?? options.column

    field.report(`${label} sudah terdaftar`, 'unique', field)
  }
}

export const uniqueRule = vine.createRule(unique, { isAsync: true })
export const registerValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(1)
      .maxLength(50)
      .alpha({ allowSpaces: true, allowDashes: true, allowUnderscores: false }),
    email: vine
      .string()
      .trim()
      .minLength(5)
      .maxLength(255)
      .email()
      .use(
        uniqueRule({
          table: 'users',
          column: 'email',
          label: 'Alamat email',
        })
      ),
    password: vine
      .string()
      .trim()
      .minLength(8)
      .maxLength(16)
      .regex(/^(?=.*\d)[A-Za-z\d]{8,16}$/)
      .confirmed(),
  })
)
