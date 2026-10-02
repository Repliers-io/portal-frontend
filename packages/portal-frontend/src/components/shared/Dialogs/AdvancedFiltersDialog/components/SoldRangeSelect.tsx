'use client'

import { useTranslations } from 'next-intl'

import { Box, MenuItem } from '@mui/material'
import { type SelectChangeEvent } from '@mui/material/Select'

import {
  relativeOptions,
  yearOptions
} from '@shared/Filters/rangeFilterOptions'

import { SelectLabel } from 'components/atoms'
import PatchedSelect from 'components/atoms/PatchedSelect'

import { type Filters } from 'services/Search'

export const SoldRangeSelect = ({
  value = '',
  label,
  disabled,
  onChange
}: {
  value?: string
  label: string
  disabled?: boolean
  onChange: (mutation: Partial<Filters>) => void
}) => {
  const t = useTranslations('MapFilters')

  const handleChange = (e: SelectChangeEvent<unknown>) => {
    const soldRange = e.target.value as string
    onChange({ soldRange: soldRange || undefined })
  }

  return (
    <Box flex={1}>
      <SelectLabel>{label}</SelectLabel>
      <PatchedSelect
        fullWidth
        displayEmpty
        variant="filled"
        value={value}
        disabled={disabled}
        onChange={handleChange}
      >
        <MenuItem value="">{t('none')}</MenuItem>
        {relativeOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
        {yearOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </PatchedSelect>
    </Box>
  )
}
