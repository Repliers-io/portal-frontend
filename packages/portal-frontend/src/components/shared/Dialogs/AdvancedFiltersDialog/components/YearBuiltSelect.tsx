import { type ChangeEvent, useState } from 'react'
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

import { type Filters } from 'services/Search'
import { toSafeNumber } from 'utils/formatters'

const minYear = 1500
const maxYear = new Date().getFullYear()

const parseYear = (value: string) => {
  const parsed = toSafeNumber(value)
  return parsed > minYear && parsed < maxYear ? parsed : ''
}

export const YearBuiltSelect = ({
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
  const t = useTranslations('Dialogs')

  const handleFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const parsed = parseYear(value)
    setFromYear(value)
    if (parsed) onChange({ minYearBuilt: parsed })
  }

  const clearFromYear = () => {
    setFromYear('')
    onChange({ minYearBuilt: undefined })
  }

  const handleToChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      <SelectLabel>{t('AdvancedFilters.yearBuilt')}</SelectLabel>
      <Stack direction="row" spacing={{ xs: 2, sm: 4 }}>
        <TextField
          sx={{ flex: 1 }}
          value={fromYear}
          placeholder={t('AdvancedFilters.any')}
          onChange={handleFromChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {t('AdvancedFilters.from')}
                </InputAdornment>
              ),
              endAdornment: fromYear ? (
                <IconButton onClick={clearFromYear}>
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
                <InputAdornment position="start">
                  {t('AdvancedFilters.to')}
                </InputAdornment>
              ),
              endAdornment: toYear ? (
                <IconButton onClick={clearToYear}>
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
