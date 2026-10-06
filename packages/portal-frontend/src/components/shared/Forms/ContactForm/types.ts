import { type Control } from 'react-hook-form'

import { type ContactFormValues } from './schema'

export type ContactFormFieldsProps = {
  control: Control<ContactFormValues>
  showMessage?: boolean
  // The dialog labels its fields; an inline form shows placeholders only.
  labels?: boolean
  variant?: 'default' | 'compact'
}
