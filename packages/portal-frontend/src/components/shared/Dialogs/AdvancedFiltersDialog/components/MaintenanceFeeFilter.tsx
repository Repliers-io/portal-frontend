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

const parseFee = (value: string) => {
  const parsed = toSafeNumber(value)
  return parsed > 0 ? parsed : ''
}

export const MaintenanceFeeFilter = ({
  to,
  disabled,
  onChange
}: {
  to?: number | null
  disabled?: boolean
  onChange: (filters: Filters) => void
}) => {
  const t = useTranslations('MapFilters')
  const [toFee, setToFee] = useState(to || '')

  const handleToChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const parsed = parseFee(value)
    setToFee(value)
    if (parsed) onChange({ maxMaintenanceFee: parsed as number })
  }

  const clearToFee = () => {
    setToFee('')
    onChange({ maxMaintenanceFee: undefined })
  }

  return (
    <Box>
      <SelectLabel>{t('maintenanceFee')}</SelectLabel>
      <Stack direction="row" spacing={{ xs: 2, sm: 4 }}>
        <TextField
          sx={{ flex: 1 }}
          value={toFee}
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
                  {toFee ? (
                    <IconButton sx={{ mr: -0.5 }} onClick={clearToFee}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                  <InputAdornment position="end">$</InputAdornment>
                </>
              ),
              inputProps: {
                inputMode: 'numeric',
                min: 0
              }
            }
          }}
        />

        {/* Repliers supports only a max maintenance fee — the empty cell sits after
            the field so it stays in the left half, aligned with paired min/max filters. */}
        <Box sx={{ flex: 1 }} />
      </Stack>
    </Box>
  )
}
