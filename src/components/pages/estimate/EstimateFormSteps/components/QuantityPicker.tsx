import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  Typography
} from '@mui/material'

import SelectLabel from 'components/atoms/SelectLabel'

import { toSafeNumber } from 'utils/formatters'

interface QuantityPickerProps {
  label?: string
  name: string
  value: string | number
  disabled?: boolean
  loading?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  error?: boolean
  helperText?: string
  min?: number
  max?: number
  // You can customize the debounce delay
  debounceDelay?: number
}

const QuantityPicker = React.forwardRef<HTMLInputElement, QuantityPickerProps>(
  (
    {
      label,
      name,
      value,
      disabled,
      loading,
      onChange,
      onBlur,
      error,
      helperText,
      min = 1,
      max = 16,
      debounceDelay = 300
    },
    ref
  ) => {
    // Local state for immediate UI updates
    const [internalValue, setInternalValue] = useState<number>(
      toSafeNumber(value)
    )

    // This ref holds the current debounce timer
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Sync local state if value changes from outside
    useEffect(() => {
      setInternalValue(toSafeNumber(value))
    }, [value])

    /**
     * Schedules the actual onChange call to the form after a debounce period
     */
    const scheduleDebounceUpdate = useCallback(
      (newVal: number) => {
        // Clear any previous timer before scheduling a new one
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
        // Schedule a new update
        debounceRef.current = setTimeout(() => {
          onChange({
            target: { name, value: newVal.toString() }
          } as React.ChangeEvent<HTMLInputElement>)
        }, debounceDelay)
      },
      [onChange, name, debounceDelay]
    )

    /**
     * Updates the local UI immediately, then debounces the actual form update
     */
    const handleValueChange = useCallback(
      (newValue: number) => {
        setInternalValue(newValue)
        scheduleDebounceUpdate(newValue)
      },
      [scheduleDebounceUpdate]
    )

    const handleIncrement = useCallback(() => {
      if (internalValue < max) {
        handleValueChange(internalValue + 1)
      }
    }, [internalValue, max])

    const handleDecrement = useCallback(() => {
      if (internalValue > min) {
        handleValueChange(internalValue - 1)
      }
    }, [internalValue, min])

    return (
      <FormControl error={error} fullWidth>
        {label && <SelectLabel disabled={disabled}>{label}</SelectLabel>}

        <ButtonGroup
          orientation="horizontal"
          size="medium"
          sx={{
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: 1,
            borderRadius: 1,
            borderColor: error ? 'error.main' : 'divider',
            '&:hover': {
              borderColor: error ? 'error.main' : 'common.black'
            },
            ...(disabled && { pointerEvents: 'none', opacity: 0.5 }),

            '& .MuiButton-root': {
              lineHeight: 1,
              fontSize: '1.75rem',
              fontWeight: 300
            }
          }}
        >
          <Button
            variant="text"
            disabled={internalValue <= Number(min)}
            onClick={handleDecrement}
            sx={{
              px: 1,
              minWidth: 0,
              width: '35%'
            }}
          >
            −
          </Button>
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {!loading &&
              `${internalValue}${internalValue === Number(max) ? '+' : ''}`}
          </Typography>
          <Button
            variant="text"
            disabled={internalValue >= Number(max)}
            onClick={handleIncrement}
            sx={{ px: 1, minWidth: 0, width: '35%' }}
          >
            +
          </Button>
        </ButtonGroup>

        {/* Hidden field to ensure the form sees the value after debounce */}
        <input
          type="hidden"
          name={name}
          value={internalValue}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
        />

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    )
  }
)

QuantityPicker.displayName = 'QuantityPicker'

export default React.memo(QuantityPicker)
