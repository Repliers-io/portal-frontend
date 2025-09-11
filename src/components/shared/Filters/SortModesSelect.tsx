import {
  MenuItem,
  type SelectChangeEvent,
  Stack,
  Typography
} from '@mui/material'

import Select from 'components/atoms/PatchedSelect'

import { type ApiSortBy } from 'services/API'
import { type Filters } from 'services/Search'
import { useFeatures } from 'providers/FeaturesProvider'

type SortMode = {
  value: ApiSortBy
  label: string
}

const SortModesSelect = ({
  filters,
  onChange
}: {
  filters?: Partial<Filters>
  onChange?: (newValue: ApiSortBy) => void
}) => {
  const features = useFeatures()

  const qualitySortModes: SortMode[] = features.aiQuality
    ? [
        { value: 'qualityDesc', label: 'Quality (high to low)' },
        { value: 'qualityAsc', label: 'Quality (low to high)' }
      ]
    : []

  const sortModes: SortMode[] = [
    { value: 'createdOnDesc', label: 'Newest to oldest' },
    { value: 'updatedOnDesc', label: 'Recently updated' },
    { value: 'listPriceDesc', label: 'Price (high to low)' },
    { value: 'listPriceAsc', label: 'Price (low to high)' },
    ...qualitySortModes
  ]

  const aiSearch = !!filters?.imageSearchItems
  const value = filters?.sortBy || 'listPriceDesc'

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as ApiSortBy
    onChange?.(newValue)
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ my: -0.25, width: { xs: 'auto', md: '100%', lg: 'auto' } }}
    >
      <Typography
        sx={{ display: { xs: 'none', sm: 'block' } }}
        variant="body2"
        color="text.hint"
      >
        Sort by:
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

export default SortModesSelect
