import React, { useCallback, useState } from 'react'

import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import { Autocomplete, Box, TextField } from '@mui/material'

import { type ApiAddress } from 'services/API'

import { formatAddress } from './utils'
import { useFetchAddresses } from '.'

const AddressAutocomplete = ({
  value = null,
  onChange,
  onBlur,
  name,
  error,
  helperText,
  disabled,
  sx,
  ...props
}: {
  value: ApiAddress | null
  onChange: (value: ApiAddress | null, reason: string) => void
  onBlur: () => void
  name: string
  error?: boolean
  helperText?: string
  disabled?: boolean
  sx?: object
  [key: string]: any
}) => {
  const [inputValue, setInputValue] = useState<string>('')

  const { options, loading } = useFetchAddresses(inputValue, value)

  const handleChange = useCallback(
    (
      _event: React.SyntheticEvent,
      newValue: ApiAddress | null,
      reason: string
    ) => {
      // always add neighborhood field to address object
      onChange(newValue ? { ...newValue, neighborhood: '' } : null, reason)
    },
    [onChange]
  )

  const handleInputChange = useCallback(
    (_event: React.SyntheticEvent, newInputValue: string) => {
      setInputValue(newInputValue)
    },
    []
  )

  const iconColor = disabled || !value ? 'disabled' : 'primary'

  return (
    <Box position="relative">
      <Box
        sx={{
          position: 'absolute',
          top: '10px',
          left: '8px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <PlaceOutlinedIcon color={iconColor} />
      </Box>
      <Autocomplete
        autoComplete
        value={value}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleChange}
        onBlur={onBlur}
        options={options}
        loading={loading}
        includeInputInList
        disabled={disabled}
        filterSelectedOptions
        filterOptions={(x) => x} // truthy values
        noOptionsText={loading ? 'Loading...' : 'No locations'}
        getOptionLabel={formatAddress}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            name={name}
            error={error}
            variant="outlined"
            helperText={helperText}
            placeholder="Enter your home address"
            {...props}
          />
        )}
        renderOption={(props, option) => {
          const optionLabel = formatAddress(option)
          return (
            <li {...props} key={optionLabel}>
              <Box
                sx={{
                  p: 1,
                  py: 1.5,
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                {optionLabel}
              </Box>
            </li>
          )
        }}
        sx={{
          ...sx,
          '.MuiInputBase-root': {
            pl: 5,
            input: {
              border: 'none !important'
            },
            '& .MuiInputBase-input ': {
              pl: 0
            }
          }
        }}
      />
    </Box>
  )
}

export default AddressAutocomplete
