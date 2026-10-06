'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { type SxProps, Typography } from '@mui/material'

import { FilterButtonGroup } from '@shared/Dialogs/AdvancedFiltersDialog/components/FilterButtonGroup'

import { useSearch } from 'providers/SearchProvider'

import { FilterChip } from './FilterChip'

export const RangeChipFilter = ({
  name,
  size,
  disabled,
  sx
}: {
  name: 'minBedrooms' | 'minBaths'
  size: 'medium' | 'small'
  disabled?: boolean
  sx?: SxProps
}) => {
  const t = useTranslations('MapFilters')
  const { filters, addFilters } = useSearch()
  const [open, setOpen] = useState(false)

  const value = filters[name] || 0
  // the unset label mirrors the filter key: minBedrooms -> allBedrooms
  const label = value
    ? t(name, { count: value })
    : t(name.replace('min', 'all'))

  return (
    <FilterChip
      label={
        <Typography variant="body1" component="span">
          {label}
        </Typography>
      }
      size={size}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      unset={!value}
      disabled={disabled}
      sx={sx}
      paperSx={{ width: 360, p: 2 }}
    >
      {/* `Any` emits 0 and a repeat tap emits false — both read as the default
          by nonZeroValue/nonDefaultFilter, exactly as in the advanced dialog. */}
      <FilterButtonGroup name={name} value={value} onChange={addFilters} />
    </FilterChip>
  )
}
