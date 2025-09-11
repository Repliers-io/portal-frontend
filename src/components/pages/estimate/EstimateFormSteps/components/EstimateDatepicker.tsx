import React from 'react'
import dayjs, { type Dayjs } from 'dayjs'

import type { DatePickerProps } from '@mui/lab'
import { FormControl, FormHelperText } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import SelectLabel from 'components/atoms/SelectLabel'

interface EstimateDatepickerProps extends DatePickerProps<Dayjs> {
  name: string
  label?: string
  placeholder?: string
  value?: Dayjs | null
  clearable: boolean
  error?: boolean
  helperText?: string
  inputRef?: React.Ref<HTMLInputElement>
  [key: string]: any
}

const EstimateDatepicker = React.forwardRef<
  HTMLInputElement,
  EstimateDatepickerProps
>(
  (
    {
      name,
      label,
      placeholder,
      value,
      clearable = true,
      error,
      helperText,
      inputRef,
      ...props
    },
    ref
  ) => {
    const id = `estimate-datepicker-${name}`

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormControl id={id} fullWidth error={error}>
          {label && <SelectLabel>{label}</SelectLabel>}

          <DatePicker
            name={name}
            label={placeholder}
            inputRef={inputRef || ref}
            sx={{ width: '100%' }}
            value={value ? dayjs(value) : null}
            slotProps={{
              field: { clearable }
            }}
            {...props}
          />

          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      </LocalizationProvider>
    )
  }
)

EstimateDatepicker.displayName = 'EstimateDatepicker'

export default EstimateDatepicker
