import dayjs, { type Dayjs } from 'dayjs'
import type React from 'react'
import { useFormContext } from 'react-hook-form'

import { dateFormat } from '@configs/i18n'

import { useFormField } from '.'

const DATE_PLACEHOLDER_REGEX = /^(MM|DD|YYYY)[-/](MM|DD|YYYY)[-/](MM|DD|YYYY)$/

const empty = (value: string) => {
  const placeholder = DATE_PLACEHOLDER_REGEX.test(value)
  const empty = !value || value?.trim() === ''

  return empty || placeholder
}

const useFormDatepicker = (name: string) => {
  const { setValue, clearErrors } = useFormContext()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onChange, onBlur, ...fieldProps } = useFormField(name)

  const onAccept = (value: Dayjs | null) => {
    const formattedValue = value ? value.format(dateFormat) : ''
    setValue(name, formattedValue)
  }

  return {
    ...fieldProps,
    onChange: (value: any) => {
      if (!value) {
        clearErrors(name)
        setValue(name, '')
      }
      setValue(name, value ? dayjs(value).format(dateFormat) : '')
    },
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value.trim()
      const validValue = !empty(value)
      const formattedValue = validValue ? dayjs(value).format(dateFormat) : ''

      setValue(name, formattedValue)
    },
    onAccept
  }
}

export default useFormDatepicker
