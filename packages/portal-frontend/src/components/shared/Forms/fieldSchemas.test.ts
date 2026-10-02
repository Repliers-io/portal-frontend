import dayjs from 'dayjs'

import { createFormSchema } from './fieldSchemas'

const t = (key: string) => key

const scheduleFields = ['name', 'email', 'phone', 'date', 'time'] as const

const required = {
  required: [...scheduleFields],
  groups: []
}

const values = {
  name: 'Ann',
  email: 'ann@example.com',
  phone: '(416) 555-0199',
  date: dayjs().add(1, 'day'),
  time: dayjs().hour(12).minute(0)
}

describe('createFormSchema', () => {
  it('builds only the fields it was given', () => {
    const schema = createFormSchema(t, { required: [], groups: [] }, [
      'name',
      'email'
    ])

    expect(Object.keys(schema.describe().keys)).toEqual(['name', 'email'])
  })

  it('accepts a valid schedule payload', () => {
    const result = createFormSchema(t, required, [...scheduleFields]).validate(
      values
    )

    expect(result.error).toBeUndefined()
  })

  it('rejects a missing date when the config requires it', () => {
    const result = createFormSchema(t, required, [...scheduleFields]).validate({
      ...values,
      date: null
    })

    expect(result.error?.details[0].message).toBe('dateRequired')
  })

  it('rejects a date in the past', () => {
    const result = createFormSchema(t, required, [...scheduleFields]).validate({
      ...values,
      date: dayjs().subtract(1, 'day')
    })

    expect(result.error?.details[0].message).toBe('dateInvalid')
  })

  it('accepts a cleared date when the config does not require it', () => {
    const result = createFormSchema(t, { required: ['name'], groups: [] }, [
      ...scheduleFields
    ]).validate({ ...values, date: null, time: null })

    expect(result.error).toBeUndefined()
  })
})
