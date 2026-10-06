import { useTranslations } from 'next-intl'

import {
  MenuItem,
  type SelectChangeEvent,
  Stack,
  Typography
} from '@mui/material'

import features from '@configs/features'

import Select from 'components/atoms/PatchedSelect'

import { type ApiSortBy } from 'services/API'
import { type Filters } from 'services/Search'
import { soldDateDesc } from 'utils/listings'

type SortMode = {
  value: ApiSortBy
  label: string
}

export const SortModesSelect = ({
  filters,
  onChange
}: {
  filters?: Partial<Filters>
  onChange?: (newValue: ApiSortBy) => void
}) => {
  const t = useTranslations('Filters')

  const qualitySortModes: SortMode[] = features.aiQuality
    ? [
        { value: 'qualityDesc', label: t('sortQualityHighLow') },
        { value: 'qualityAsc', label: t('sortQualityLowHigh') }
      ]
    : []

  // The sold-date sort token is tenant-dependent (`'soldDateDesc'` vs
  // `'closedDateDesc'`), so the option value is the `soldDateDesc` constant,
  // never a literal.
  const soldSortModes: SortMode[] = [filters?.listingStatus]
    .flat()
    .includes('sold')
    ? [{ value: soldDateDesc, label: t('sortRecentlySold') }]
    : []

  const sortModes: SortMode[] = [
    { value: 'createdOnDesc', label: t('sortNewest') },
    { value: 'updatedOnDesc', label: t('sortRecentlyUpdated') },
    ...soldSortModes,
    { value: 'listPriceDesc', label: t('sortPriceHighLow') },
    { value: 'listPriceAsc', label: t('sortPriceLowHigh') },
    ...qualitySortModes
  ]

  const aiSearch = !!filters?.imageSearchItems
  const value = filters?.sortBy || 'listPriceDesc'

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as ApiSortBy
    onChange?.(newValue)
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ my: -0.25 }}>
      <Typography
        sx={{ display: { xs: 'none', md: 'block' } }}
        variant="body2"
        color="text.hint"
      >
        {t('sortBy')}
      </Typography>
      <Select
        size="small"
        color="primary"
        variant="standard"
        value={value}
        onChange={handleChange}
        disabled={aiSearch}
        sx={{
          height: 32,
          bgcolor: 'transparent',
          '&.MuiInputBase-colorPrimary': {
            fontWeight: 600
          }
        }}
      >
        {sortModes.map(({ value, label }) => (
          <MenuItem value={value} key={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  )
}
