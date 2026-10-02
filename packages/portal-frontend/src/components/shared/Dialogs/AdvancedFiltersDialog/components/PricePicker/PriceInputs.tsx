import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField
} from '@mui/material'

import { CloseIcon } from '@configs/icons'

import { SelectLabel } from 'components/atoms'

import { formatEnglishNumber, toSafeNumber } from 'utils/formatters'

// 0 is "no limit" on either end, so it shows as the empty field's placeholder
const format = (price: number) => (price ? formatEnglishNumber(price) : '')

// Typing edits the text only; the price is applied on blur or Enter, so the search
// doesn't run for every digit on the way to the number.
const PriceInput = ({
  label,
  placeholder,
  value,
  onChange
}: {
  label: string
  placeholder: string
  value: number
  onChange: (value: number) => void
}) => {
  const [text, setText] = useState(format(value))

  useEffect(() => setText(format(value)), [value])

  const commit = () => {
    const price = toSafeNumber(text)
    // an unchanged price never comes back as a new `value`, so re-format it here
    if (price === value) setText(format(value))
    else onChange(price)
  }

  return (
    <Box sx={{ flex: 1 }}>
      <SelectLabel>{label}</SelectLabel>
      <TextField
        fullWidth
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: text ? (
              <IconButton onClick={() => onChange(0)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null
          },
          htmlInput: { inputMode: 'numeric' }
        }}
      />
    </Box>
  )
}

export const PriceInputs = ({
  values: [min, max],
  placeholders: [minPlaceholder, maxPlaceholder],
  onChange
}: {
  values: number[]
  placeholders: string[]
  onChange: (values: number[]) => void
}) => {
  const t = useTranslations('MapFilters')

  return (
    <Stack
      data-price-inputs
      useFlexGap
      direction="row"
      spacing={{ xs: 2, sm: 4 }}
    >
      <PriceInput
        label={t('min')}
        placeholder={minPlaceholder}
        value={min}
        onChange={(price) => onChange([price, max])}
      />
      <PriceInput
        label={t('max')}
        placeholder={maxPlaceholder}
        value={max}
        onChange={(price) => onChange([min, price])}
      />
    </Stack>
  )
}
