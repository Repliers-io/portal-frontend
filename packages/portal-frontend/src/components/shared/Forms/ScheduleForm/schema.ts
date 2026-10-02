import { type Dayjs } from 'dayjs'

import type { FormFieldName } from '@defaults/forms'

import { identityFields } from '../fieldSchemas'

export type ScheduleFormValues = {
  name: string
  email: string
  phone: string
  date: Dayjs | null
  time: Dayjs | null
}

export const scheduleFields: FormFieldName[] = [
  ...identityFields,
  'date',
  'time'
]
