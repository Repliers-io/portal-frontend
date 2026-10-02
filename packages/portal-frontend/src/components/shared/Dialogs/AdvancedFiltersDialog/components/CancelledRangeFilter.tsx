'use client'

import { useTranslations } from 'next-intl'

import { Box, MenuItem, Stack } from '@mui/material'

import { allRangeOptions } from '@shared/Filters/rangeFilterOptions'

import { SelectLabel } from 'components/atoms'
import PatchedSelect from 'components/atoms/PatchedSelect'

export const CancelledRangeFilter = ({
  value = '',
  onChange
}: {
  value?: string
  onChange: (mutation: Record<string, unknown>) => void
}) => {
  const t = useTranslations('MapFilters')

  const handleChange = (e: any) => {
    const cancelledRange = e.target.value as string
    onChange({ cancelledRange: cancelledRange || undefined })
  }

  const selectedOption = allRangeOptions.find((o) => o.value === value)

  return (
    <Stack direction="row" spacing={{ xs: 2, sm: 4 }}>
      <Box flex={1}>
        <SelectLabel>{t('cancelled')}</SelectLabel>
        <PatchedSelect
          fullWidth
          displayEmpty
          variant="filled"
          value={value}
          onChange={handleChange}
          renderValue={() => {
            return (
              <Stack
                spacing={2}
                direction="row"
                alignItems="center"
                sx={{ height: 16 }}
              >
                <Box
                  component="span"
                  sx={{
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: 'text.hint'
                  }}
                >
                  {t('delistedDate')}
                </Box>
                {value ? (selectedOption?.label ?? value) : ''}
              </Stack>
            )
          }}
        >
          <MenuItem value="">{t('none')}</MenuItem>
          {allRangeOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </PatchedSelect>
      </Box>
      <Box flex={1} />
    </Stack>
  )
}
