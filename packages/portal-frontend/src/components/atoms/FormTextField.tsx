import { FormControl, TextField, type TextFieldProps } from '@mui/material'

import SelectLabel from './SelectLabel'

type FormTextFieldProps = Omit<TextFieldProps, 'label' | 'sx'> & {
  label: string
}

// unified template wrapper around inputs for step-by-step implementation into forms and make template consistent,
// also allow to encapsulate design variants for specific cases,
// like movesmartly flat input, see movesmartly override
export const FormTextField = ({
  label,
  error,
  disabled,
  ...textFieldProps
}: FormTextFieldProps) => (
  <FormControl error={error} disabled={disabled} sx={{ flex: 1 }}>
    <SelectLabel disabled={disabled}>{label}</SelectLabel>
    <TextField
      fullWidth
      error={error}
      disabled={disabled}
      {...textFieldProps}
    />
  </FormControl>
)
