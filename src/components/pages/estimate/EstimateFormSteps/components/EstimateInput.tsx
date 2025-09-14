import React, { useLayoutEffect, useRef } from 'react'

import {
  FormControl,
  InputAdornment,
  TextField,
  type TextFieldProps,
  useForkRef
} from '@mui/material'

import SelectLabel from 'components/atoms/SelectLabel'

type EstimateInputProps = TextFieldProps & {
  name: string
  value: string | number | undefined
  label?: string
  type?: React.HTMLInputTypeAttribute
  min?: number
  readOnly?: boolean
  prefix?: string
  suffix?: string
  helperText?: string
  error?: boolean
  englishNumber?: boolean
  fractions?: number
  inputRef?: React.Ref<HTMLInputElement>
  [key: string]: any
}

import { formatEnglishNumber } from 'utils/formatters'

const formatter = (value: number | string, fractions = 0) =>
  value ? formatEnglishNumber(value?.toString() || '', fractions) : ''

const EstimateInput = React.forwardRef<HTMLInputElement, EstimateInputProps>(
  (
    {
      name,
      value,
      label,
      min,
      type = 'number',
      readOnly = false,
      prefix,
      suffix,
      englishNumber,
      fractions = 0,
      helperText,
      error,
      inputRef,
      ...props
    },
    ref
  ) => {
    const id = `estimate-${name}`

    const displayValue =
      englishNumber && value && !isNaN(value)
        ? formatter(value, fractions)
        : value || ''

    const removeFormatting = (e: any) => {
      const value = e.target.value
      if (englishNumber && value) {
        e.target.value = value.replace(/,/g, '')
      }
      return e
    }
    const localRef = useRef<HTMLInputElement | null>(null)
    // useForkRef is a MUI utility to combine multiple refs
    const handleRef = useForkRef(useForkRef(ref, inputRef), localRef)

    useLayoutEffect(() => {
      if (englishNumber && localRef.current) {
        localRef.current.value = displayValue
      }
    }, [displayValue, englishNumber])

    return (
      <FormControl id={id} fullWidth error={error}>
        {label && <SelectLabel>{label}</SelectLabel>}
        <TextField
          fullWidth
          name={name}
          error={error}
          helperText={helperText}
          type={englishNumber ? 'text' : type}
          value={displayValue}
          inputRef={handleRef}
          slotProps={{
            htmlInput: {
              min,
              ...(englishNumber && {
                inputMode: 'numeric',
                pattern: '[0-9,]*'
              })
            },
            input: {
              readOnly: readOnly,
              startAdornment: prefix && (
                <InputAdornment position="start">{prefix}</InputAdornment>
              ),
              endAdornment: suffix && (
                <InputAdornment position="end">{suffix}</InputAdornment>
              )
            }
          }}
          {...props}
          onChange={(e) => props.onChange?.(removeFormatting(e))}
          onBlur={(e) => props.onBlur?.(removeFormatting(e))}
        />
      </FormControl>
    )
  }
)

EstimateInput.displayName = 'EstimateInput'

export default EstimateInput
