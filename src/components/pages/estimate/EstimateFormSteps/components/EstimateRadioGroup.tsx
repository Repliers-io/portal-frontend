import React from 'react'

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  type RadioGroupProps,
  Stack
} from '@mui/material'

import SelectLabel from 'components/atoms/SelectLabel'

interface EstimateRadioGroupProps extends RadioGroupProps {
  name: string
  label?: string
  helperText?: string
  error?: boolean
  options: [string, string][]
}

const EstimateRadioGroup = React.forwardRef<
  HTMLDivElement,
  EstimateRadioGroupProps
>(({ name, label, error, helperText, options, ...props }, ref) => {
  return (
    <>
      <FormControl fullWidth error={error}>
        <Stack spacing={2}>
          {label && <SelectLabel>{label}</SelectLabel>}
          <RadioGroup name={name} {...props} ref={ref}>
            {options.map(([value, label]) => (
              <FormControlLabel
                key={value}
                value={value}
                label={label}
                control={<Radio />}
              />
            ))}
          </RadioGroup>
        </Stack>
      </FormControl>
      {error && (
        <FormHelperText sx={{ color: 'error.main' }}>
          {helperText}
        </FormHelperText>
      )}
    </>
  )
})

EstimateRadioGroup.displayName = 'EstimateRadioGroup'

export default EstimateRadioGroup
