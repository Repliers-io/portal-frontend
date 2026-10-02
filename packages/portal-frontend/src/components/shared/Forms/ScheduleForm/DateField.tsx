'use client'

import dayjs from 'dayjs'
import { type Control, Controller } from 'react-hook-form'

import { DatePicker, TimePicker } from '@mui/x-date-pickers'

import { type ScheduleFormValues } from './schema'

type DateFieldProps = {
  name: 'date' | 'time'
  control: Control<ScheduleFormValues>
  label: string
}

export const DateField = ({ name, control, label }: DateFieldProps) => {
  const Picker = name === 'date' ? DatePicker : TimePicker

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Picker
          label={label}
          value={field.value}
          onChange={field.onChange}
          inputRef={field.ref}
          {...(name === 'date' && { minDate: dayjs() })}
          sx={{ width: '100%' }}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!fieldState.error,
              helperText: fieldState.error?.message
            }
          }}
        />
      )}
    />
  )
}
