import { type Control, Controller, type FieldPath } from 'react-hook-form'

import { type TextFieldProps } from '@mui/material'

import { FormTextField } from 'components/atoms'

import type { ApiUserProfile } from 'services/API'

type ProfileFormValues = Partial<ApiUserProfile>

type ProfileTextFieldProps = Omit<
  TextFieldProps,
  | 'name'
  | 'error'
  | 'helperText'
  | 'value'
  | 'onChange'
  | 'onBlur'
  | 'ref'
  | 'label'
  | 'sx'
> & {
  name: FieldPath<ProfileFormValues>
  control: Control<ProfileFormValues>
  label: string
  formatter?: (value: string, previousValue: string) => string
}

export const ProfileTextField = ({
  name,
  control,
  label,
  formatter,
  ...textFieldProps
}: ProfileTextFieldProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <FormTextField
        label={label}
        {...field}
        {...textFieldProps}
        onChange={(e) => {
          const next = formatter
            ? formatter(e.target.value, (field.value as string) ?? '')
            : e.target.value
          field.onChange(next)
        }}
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
      />
    )}
  />
)
