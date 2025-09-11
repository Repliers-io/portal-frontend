import React from 'react'

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Typography
} from '@mui/material'
import type { CheckboxProps } from '@mui/material/Checkbox/Checkbox'

interface EstimateCheckboxProps extends CheckboxProps {
  name: string
  label?: string
  value?: boolean
  helperText?: string
  error?: boolean
  inputRef?: React.Ref<HTMLInputElement>
  [key: string]: any
}

const EstimateCheckbox = React.forwardRef<
  HTMLInputElement,
  EstimateCheckboxProps
>(({ name, label, value, helperText, error, inputRef, ...props }, ref) => {
  const id = `estimate-checkbox-${name}`

  return (
    <FormControl id={id} fullWidth error={error}>
      <FormControlLabel
        sx={{
          '& .MuiButtonBase-root': {
            alignSelf: 'flex-start'
          }
        }}
        control={
          <Checkbox
            sx={{ my: -1 }}
            size="small"
            name={name}
            checked={value}
            inputRef={inputRef || ref}
            {...props}
          />
        }
        label={<Typography variant="body2">{label}</Typography>}
      />
      {helperText && (
        <FormHelperText sx={{ ml: 4 }}>{helperText}</FormHelperText>
      )}
    </FormControl>
  )
})

EstimateCheckbox.displayName = 'EstimateCheckbox'

export default EstimateCheckbox
