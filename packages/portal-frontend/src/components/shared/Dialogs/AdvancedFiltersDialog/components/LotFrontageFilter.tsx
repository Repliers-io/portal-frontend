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

const parseFrontage = (value: string) => {
  const parsed = toSafeNumber(value)
  return parsed > 0 ? parsed : ''
}

export const LotFrontageFilter = ({
  from,
  to,
  disabled,
  onChange
}: {
  from?: number | null
  to?: number | null
  disabled?: boolean
  onChange: (filters: Filters) => void
}) => {
  const t = useTranslations('MapFilters')
  const [fromVal, setFromVal] = useState(from || '')
  const [toVal, setToVal] = useState(to || '')

  const handleFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const parsed = parseFrontage(value)
    setFromVal(value)
    if (parsed) onChange({ minLotWidth: parsed as number })
  }

  const clearFrom = () => {
    setFromVal('')
    onChange({ minLotWidth: undefined })
  }

  const handleToChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const parsed = parseFrontage(value)
    setToVal(value)
    if (parsed) onChange({ maxLotWidth: parsed as number })
  }

  const clearTo = () => {
    setToVal('')
    onChange({ maxLotWidth: undefined })
  }

  const color = disabled ? 'text.disabled' : 'text.primary'

  return (
    <Box>
      <SelectLabel color={color}>{t('lotFrontage')}</SelectLabel>
      <Stack direction="row" spacing={{ xs: 2, sm: 4 }}>
        <TextField
          sx={{ flex: 1 }}
          value={fromVal}
          placeholder={t('any')}
          disabled={disabled}
          onChange={handleFromChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">{t('from')}</InputAdornment>
              ),
              endAdornment: (
                <>
                  {fromVal ? (
                    <IconButton onClick={clearFrom}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <InputAdornment position="end">{t('feet')}</InputAdornment>
                  )}
                </>
              ),
              inputProps: { inputMode: 'numeric', min: 0 }
            }
          }}
        />
        <TextField
          sx={{ flex: 1 }}
          value={toVal}
          placeholder={t('any')}
          disabled={disabled}
          onChange={handleToChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">{t('to')}</InputAdornment>
              ),
              endAdornment: (
                <>
                  {toVal ? (
                    <IconButton onClick={clearTo}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <InputAdornment position="end">{t('feet')}</InputAdornment>
                  )}
                </>
              ),
              inputProps: { inputMode: 'numeric', min: 0 }
            }
          }}
        />
      </Stack>
    </Box>
  )
}
