import {
  type FieldErrors,
  type FieldValues,
  type Resolver
} from 'react-hook-form'

import type { FormFieldName } from '@defaults/forms'

export const requiredAnyType = 'requiredAny'

/**
 * "At least one of" cannot live in Joi: `.or()` reports on the object root, and
 * @hookform/resolvers keys that error as "" (path.join('.') of an empty path),
 * so it never reaches a field. This adds the check after the schema ran.
 */
export const withGroupCheck = <TValues extends FieldValues>(
  resolver: Resolver<TValues>,
  groups: FormFieldName[][],
  message: string
): Resolver<TValues> => {
  if (!groups.length) return resolver

  return async (data, context, options) => {
    const result = await resolver(data, context, options)
    const values = data as Record<string, unknown>
    const errors = { ...result.errors } as Record<string, unknown>

    groups.forEach((group) => {
      const filled = group.some((field) => String(values[field] ?? '').trim())
      if (filled) return

      // The unmet requirement belongs to the whole group, so every member reads as
      // errored; the message itself is shown once, by the hint under the group.
      group.forEach((field) => {
        if (!errors[field]) errors[field] = { type: requiredAnyType, message }
      })
    })

    // ResolverResult is a discriminated union: a failed result carries no values.
    return Object.keys(errors).length
      ? { errors: errors as FieldErrors<TValues>, values: {} }
      : result
  }
}
