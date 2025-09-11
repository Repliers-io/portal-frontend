import { type FocusEvent } from 'react'
import { type FieldErrors } from 'react-hook-form'

import { serverValidationFields } from '@configs/estimate'

export const handleErrorBlur = (field: any, errors: FieldErrors) => {
  return () => {
    if (
      serverValidationFields.includes(field.name) &&
      errors[field.name]?.type === 'server'
    ) {
      return
    }
    field.onBlur({} as FocusEvent<HTMLInputElement>)
  }
}
