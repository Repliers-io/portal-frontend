'use client'

import { Box, MenuItem } from '@mui/material'
import { type SelectChangeEvent } from '@mui/material/Select'

import { activeRangeOptions } from '@shared/Filters/rangeFilterOptions'

import { SelectLabel } from 'components/atoms'
import PatchedSelect from 'components/atoms/PatchedSelect'

import { type Filters } from 'services/Search'

export const ActiveRangeSelect = ({
  value = '',
  disabled,
  onChange
}: {
  value?: string
  disabled?: boolean
  onChange: (mutation: Partial<Filters>) => void
}) => {
  const handleChange = (e: SelectChangeEvent<unknown>) => {
    const activeRange = e.target.value as string
    onChange({ activeRange: activeRange || undefined })
  }

  return (
    <Box flex={1}>
      <SelectLabel>Active</SelectLabel>
      <PatchedSelect
        fullWidth
        displayEmpty
        variant="filled"
        value={value}
        disabled={disabled}
        onChange={handleChange}
      >
        <MenuItem value="">Any</MenuItem>
        {activeRangeOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </PatchedSelect>
    </Box>
  )
}
