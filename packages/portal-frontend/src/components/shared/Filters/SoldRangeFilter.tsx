'use client'

import { useTranslations } from 'next-intl'

import { Box, MenuItem, Skeleton } from '@mui/material'
import { type SelectChangeEvent } from '@mui/material/Select'

import { activeBg } from '@configs/colors'

import PatchedSelect from 'components/atoms/PatchedSelect'

import { useSearch } from 'providers/SearchProvider'
import useClientSide from 'hooks/useClientSide'

import {
  allRangeOptions,
  relativeOptions,
  yearOptions
} from './rangeFilterOptions'

export const SoldRangeFilter = ({ size }: { size: 'medium' | 'small' }) => {
  const { filters, addFilters, removeFilter } = useSearch()
  const t = useTranslations('MapFilters')
  const value = filters.soldRange ?? ''
  const label = t(filters.type === 'lease' ? 'leased' : 'sold')
  const clientSide = useClientSide()

  const handleChange = (e: SelectChangeEvent<unknown>) => {
    const soldRange = e.target.value as string
    if (!soldRange) {
      removeFilter('soldRange')
    } else {
      addFilters({ soldRange })
    }
  }

  const selectedOption = allRangeOptions.find((o) => o.value === value)

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          height: size === 'small' ? 32 : 38,
          width: size === 'small' ? 80 : 94,
          borderRadius: '999px'
        }}
      />
    )
  }

  return (
    <PatchedSelect
      size={size}
      value={value}
      // The two range filters are exclusive: whichever is set locks the other.
      // A filter that still holds a value stays open so it can be cleared —
      // otherwise a link carrying both would lock the pair with no way out.
      disabled={Boolean(filters.activeRange) && !value}
      displayEmpty
      variant="filled"
      onChange={handleChange}
      onClear={value ? () => removeFilter('soldRange') : undefined}
      MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
      // A set filter keeps the pill filled in every state. Three `&` to outweigh
      // the theme's own hover rule, which is itself a three-class selector
      // (`.MuiFilledInput-root.MuiInputBase-colorPrimary:hover`) — otherwise
      // hovering a selected pill would lighten it back to the idle hover tint.
      sx={{ ...(value && { '&&&, &&&:hover': { bgcolor: activeBg } }) }}
      renderValue={() => {
        if (!value) {
          return label
        }
        return (
          <Box
            component="span"
            sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}
          >
            {label}
            <Box component="span" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              {selectedOption?.short ?? value}
            </Box>
          </Box>
        )
      }}
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
  )
}
