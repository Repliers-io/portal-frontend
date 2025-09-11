import React from 'react'

import {
  FormControl,
  FormHelperText,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'

import {
  type EstimateListingType as Item,
  estimateListingTypes as items
} from '@configs/estimate'

import { formatUnionKey } from 'utils/strings'

type PropertyTypeSelectProps = {
  name: string
  value: Item
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  loading?: boolean
  error?: boolean
  helperText?: string
}

const PropertyTypeSelect = React.forwardRef<
  HTMLInputElement,
  PropertyTypeSelectProps
>(({ name, value, onChange, onBlur, error, helperText, loading }, ref) => {
  const handleToggleChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: Item | null
  ) => {
    if (newValue !== null) {
      const syntheticEvent = {
        target: { name, value: newValue }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }

  return (
    <FormControl fullWidth error={error}>
      <ToggleButtonGroup
        exclusive
        color="primary"
        value={loading ? null : value}
        onChange={handleToggleChange}
        onBlur={onBlur}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          bgcolor: 'background.paper',
          border: 1,
          borderRadius: 1,
          overflow: 'hidden',
          borderColor: error ? 'error.main' : 'divider',
          'button.MuiButtonBase-root': {
            display: 'flex',
            flex: 1
          },
          '& .MuiToggleButtonGroup-middleButton::after': {
            borderColor: 'divider'
          }
        }}
      >
        {items.map((item) => (
          <ToggleButton
            key={item}
            value={item}
            sx={{ borderRadius: 0, px: 1, whiteSpace: 'nowrap' }}
          >
            {formatUnionKey(item)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <TextField
        select
        fullWidth
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        inputRef={ref}
        error={error}
        sx={{ display: { xs: 'block', sm: 'none' } }}
      >
        {items.map((item) => (
          <MenuItem key={item} value={item}>
            {formatUnionKey(item)}
          </MenuItem>
        ))}
      </TextField>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
})

PropertyTypeSelect.displayName = 'PropertyTypeSelect'

export default PropertyTypeSelect
