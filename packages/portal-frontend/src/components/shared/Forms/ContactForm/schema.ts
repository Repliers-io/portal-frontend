import type { FormFieldName } from '@defaults/forms'

import { identityFields } from '../fieldSchemas'

export type ContactFormValues = {
  name: string
  email: string
  phone: string
  message: string
}

export const contactFields: FormFieldName[] = [...identityFields, 'message']
