'use client'

import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues
} from 'react-hook-form'

import {
  type SxProps,
  TextField,
  type TextFieldProps,
  type Theme
} from '@mui/material'

import type { FormFieldName } from '@defaults/forms'

import { FieldWrapper } from './FieldWrapper'
import { useFieldRequirement } from './FormRequirements'
import { requiredAnyType } from './groupResolver'

type FormFieldProps<TValues extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'error' | 'helperText' | 'value' | 'onChange' | 'onBlur' | 'ref'
> & {
  // The field must exist on the form AND be a name the config can talk about.
  name: FieldPath<TValues> & FormFieldName
  control: Control<TValues>
  label?: string
  // the contact form's caption over the field instead of MUI's floating label
  labelAbove?: boolean
  containerSx?: SxProps<Theme>
  formatter?: (value: string, previousValue: string) => string
}

export const FormField = <TValues extends FieldValues>({
  name,
  control,
  label,
  labelAbove,
  containerSx,
  formatter,
  ...textFieldProps
}: FormFieldProps<TValues>) => {
  const { required, grouped } = useFieldRequirement(name)
  const marked = required && !grouped

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FieldWrapper
          label={labelAbove ? label : undefined}
          required={marked}
          containerSx={containerSx}
        >
          <TextField
            {...field}
            {...textFieldProps}
            label={labelAbove ? undefined : label}
            required={!labelAbove && marked}
            onChange={(e) => {
              const next = formatter
                ? formatter(e.target.value, field.value)
                : e.target.value
              field.onChange(next)
            }}
            error={!!fieldState.error}
            helperText={
              fieldState.error?.type === requiredAnyType
                ? undefined
                : fieldState.error?.message
            }
          />
        </FieldWrapper>
      )}
    />
  )
}
