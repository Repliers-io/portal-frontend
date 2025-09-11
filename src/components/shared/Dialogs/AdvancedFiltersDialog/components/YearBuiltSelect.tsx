import { useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField
} from '@mui/material'

import SelectLabel from 'components/atoms/SelectLabel'

import { type Filters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'

const minYear = 1500
const maxYear = new Date().getFullYear()

const parseYear = (value: string) => {
  const parsed = toSafeNumber(value)
  return parsed > minYear && parsed < maxYear ? parsed : ''
}

const YearBuiltSelect = ({
  from,
  to,
  onChange
}: {
  from?: number | null
  to?: number | null
  onChange: (filters: Filters) => void
}) => {
  const [fromYear, setFromYear] = useState(from || '')
  const [toYear, setToYear] = useState(to || '')

  const handleFromChange = (e: any) => {
    const { value } = e.target
    const parsed = parseYear(value)
    setFromYear(value)
    if (parsed) onChange({ minYearBuilt: parsed })
  }

  const clearFromYear = () => {
    setFromYear('')
    onChange({ minYearBuilt: undefined })
  }

  const handleToChange = (e: any) => {
    const { value } = e.target
    const parsed = parseYear(value)
    setToYear(value)
    if (parsed) onChange({ maxYearBuilt: parsed })
  }

  const clearToYear = () => {
    setToYear('')
    onChange({ maxYearBuilt: undefined })
  }

  return (
    <Box>
      <SelectLabel>Year built</SelectLabel>
      <Stack direction="row" spacing={4}>
        <TextField
          sx={{ flex: 1 }}
          value={fromYear}
          placeholder="Any"
          onChange={handleFromChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">From</InputAdornment>
              ),
              endAdornment: fromYear ? (
                <IconButton sx={{ mr: -1 }} onClick={clearFromYear}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null,
              inputProps: {
                inputMode: 'numeric',
                pattern: '[12][0-9]{3}',
                maxLength: 4,
                min: minYear,
                max: maxYear
              }
            }
          }}
        />

        <TextField
          sx={{ flex: 1 }}
          placeholder={maxYear.toString()}
          value={toYear}
          onChange={handleToChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">To</InputAdornment>
              ),
              endAdornment: toYear ? (
                <IconButton sx={{ mr: -1 }} onClick={clearToYear}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null,
              inputProps: {
                inputMode: 'numeric',
                pattern: '[12][0-9]{3}',
                maxLength: 4,
                min: minYear,
                max: maxYear
              }
            }
          }}
        />
      </Stack>
    </Box>
  )
}

export default YearBuiltSelect
