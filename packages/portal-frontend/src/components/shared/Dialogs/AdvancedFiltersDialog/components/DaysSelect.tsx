import { useTranslations } from 'next-intl'

import { Box, MenuItem, Stack } from '@mui/material'

import { type ListingStatus } from '@configs/filters'

import { SelectLabel } from 'components/atoms'
import Select from 'components/atoms/PatchedSelect'

import {
  type DaysOnMarket,
  daysOnMarket,
  type Filters,
  type SoldWithin,
  soldWithin
} from 'services/Search'
import { formatUnionKey } from 'utils/strings'

export const DaysSelect = ({
  status,
  daysValue,
  soldValue,
  onChange
}: {
  status: ListingStatus | undefined
  daysValue: DaysOnMarket | undefined
  soldValue: SoldWithin | undefined
  onChange: (filters: Filters) => void
}) => {
  const t = useTranslations('MapFilters')
  const sold = status === 'sold'
  const active = status === 'active'

  const handleMarketDaysChange = (e: any) => {
    onChange({ daysOnMarket: e.target?.value })
  }

  const handleSoldDaysChange = (e: any) => {
    onChange({ soldWithin: e.target?.value })
  }

  return (
    <Stack direction="row" spacing={{ xs: 2, sm: 4 }}>
      <Box flex={1}>
        <SelectLabel disabled={sold}>{t('daysOnMarket')}</SelectLabel>

        <Select
          fullWidth
          variant="filled"
          disabled={sold}
          value={daysValue}
          onChange={handleMarketDaysChange}
        >
          {daysOnMarket.map((key) => (
            <MenuItem key={key} value={key}>
              {formatUnionKey(key)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box flex={1}>
        <SelectLabel disabled={active}>{t('soldWithin')}</SelectLabel>

        <Select
          fullWidth
          variant="filled"
          disabled={active}
          value={soldValue}
          onChange={handleSoldDaysChange}
        >
          {soldWithin.map((key) => (
            <MenuItem key={key} value={key}>
              {formatUnionKey(key)}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Stack>
  )
}
