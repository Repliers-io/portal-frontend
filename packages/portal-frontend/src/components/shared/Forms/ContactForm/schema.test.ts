import { createFormSchema } from '../fieldSchemas'
import { type ResolvedRequirements } from '../requirements'

import { contactFields, type ContactFormValues } from './schema'

const t = (key: string) => key

const validate = (
  requirements: ResolvedRequirements,
  values: Partial<ContactFormValues>
) =>
  createFormSchema<ContactFormValues>(t, requirements, contactFields).validate(
    { name: '', email: '', phone: '', message: '', ...values },
    { abortEarly: false }
  )

const errorFields = (result: ReturnType<typeof validate>) =>
  result.error?.details.map((detail) => detail.path.join('.')) ?? []

const allRequired: ResolvedRequirements = {
  required: ['name', 'email', 'phone', 'message'],
  groups: []
}

describe('contact form schema', () => {
  it('rejects an empty form when every field is required', () => {
    const result = validate(allRequired, {})

    expect(errorFields(result)).toEqual(['name', 'email', 'phone', 'message'])
  })

  it('accepts blank optional fields', () => {
    const result = validate({ required: ['name'], groups: [] }, { name: 'Ann' })

    expect(result.error).toBeUndefined()
  })

  it('still validates the format of a filled optional field', () => {
    const result = validate(
      { required: ['name'], groups: [] },
      { name: 'Ann', email: 'not-an-email' }
    )

    expect(errorFields(result)).toEqual(['email'])
  })

  it('rejects a phone that libphonenumber cannot parse', () => {
    const result = validate(
      { required: ['name'], groups: [] },
      { name: 'Ann', phone: '123' }
    )

    expect(result.error?.details[0].message).toBe('phoneInvalid')
  })

  it('enforces the name length cap regardless of requiredness', () => {
    const result = validate(
      { required: [], groups: [] },
      { name: 'a'.repeat(71) }
    )

    expect(result.error?.details[0].message).toBe('nameMaxLength')
  })

  it('leaves group members alone — the resolver owns that check', () => {
    const result = validate(
      { required: ['name'], groups: [['email', 'phone']] },
      { name: 'Ann' }
    )

    expect(result.error).toBeUndefined()
  })
})
