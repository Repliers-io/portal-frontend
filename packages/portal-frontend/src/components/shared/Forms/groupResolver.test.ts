import { type Resolver } from 'react-hook-form'

import { type ContactFormValues } from './ContactForm/schema'
import { requiredAnyType, withGroupCheck } from './groupResolver'

const values: ContactFormValues = {
  name: 'Ann',
  email: '',
  phone: '',
  message: ''
}

const clean: Resolver<ContactFormValues> = async (data) => ({
  values: data,
  errors: {}
})

const failing: Resolver<ContactFormValues> = async () => ({
  values: {},
  errors: { email: { type: 'string.email', message: 'emailInvalid' } }
})

const run = (resolver: Resolver<ContactFormValues>, data: ContactFormValues) =>
  resolver(data, undefined, {
    fields: {},
    shouldUseNativeValidation: false
  } as never)

describe('withGroupCheck', () => {
  it('reports every group member when all of them are blank', async () => {
    const result = await run(
      withGroupCheck(clean, [['email', 'phone']], 'emailOrPhoneRequired'),
      values
    )

    const groupError = {
      type: requiredAnyType,
      message: 'emailOrPhoneRequired'
    }

    expect(result.errors.email).toEqual(groupError)
    expect(result.errors.phone).toEqual(groupError)
    expect(result.values).toEqual({})
  })

  it('passes when one member is filled', async () => {
    const result = await run(
      withGroupCheck(clean, [['email', 'phone']], 'emailOrPhoneRequired'),
      { ...values, phone: '(416) 555-0199' }
    )

    expect(result.errors).toEqual({})
    expect(result.values).toEqual({ ...values, phone: '(416) 555-0199' })
  })

  it('treats whitespace as blank', async () => {
    const result = await run(
      withGroupCheck(clean, [['email', 'phone']], 'emailOrPhoneRequired'),
      { ...values, email: '   ' }
    )

    expect(result.errors.phone?.type).toBe(requiredAnyType)
  })

  it('keeps an existing field error instead of overwriting it', async () => {
    const result = await run(
      withGroupCheck(failing, [['email', 'phone']], 'emailOrPhoneRequired'),
      values
    )

    expect(result.errors.email?.message).toBe('emailInvalid')
    expect(result.errors.phone?.type).toBe(requiredAnyType)
  })

  it('is a no-op without groups', async () => {
    const result = await run(withGroupCheck(clean, [], 'x'), values)

    expect(result.errors).toEqual({})
  })
})
