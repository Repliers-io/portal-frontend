import { Box, Stack, Typography } from '@mui/material'

import { type Filters } from 'services/Search'

import { DaysSelect, FilterButtonGroup, PricePicker, YearBuiltSelect } from '.'

const bedsItems: [string, number][] = [
  ['Any', 0],
  ['Studio', -1],
  ['1+', 1],
  ['2+', 2],
  ['3+', 3],
  ['4+', 4]
]

const AdvancedFiltersTab = ({
  dialogState,
  priceBuckets,
  onChange
}: {
  dialogState: Filters
  priceBuckets: Record<string, number>
  onChange: (mutation: Partial<Filters>) => void
}) => {
  // helpers
  const {
    minPrice,
    maxPrice,
    minBaths,
    minBeds,
    minGarageSpaces,
    minParkingSpaces,
    listingStatus,
    soldWithin,
    daysOnMarket,
    minYearBuilt,
    maxYearBuilt
  } = dialogState

  const handlePriceChange = ([minPrice, maxPrice]: number[]) => {
    onChange({ minPrice, maxPrice })
  }

  return (
    <Stack direction="column" spacing={{ xs: 2, sm: 3, md: 4 }}>
      <FilterButtonGroup
        label="Beds"
        name="minBeds"
        value={minBeds || 0}
        items={bedsItems}
        onChange={onChange}
      />
      <FilterButtonGroup
        label="Baths"
        name="minBaths"
        value={minBaths || 0}
        onChange={onChange}
      />
      <FilterButtonGroup
        label="Garage"
        name="minGarageSpaces"
        value={minGarageSpaces || 0}
        onChange={onChange}
      />

      <FilterButtonGroup
        label="Parking"
        name="minParkingSpaces"
        value={minParkingSpaces || 0}
        onChange={onChange}
      />
      <Box>
        <Typography fontWeight={500}>Price</Typography>
        <PricePicker
          variant="bars"
          buckets={priceBuckets}
          values={[minPrice || 0, maxPrice || 0]}
          onChange={handlePriceChange}
        />
      </Box>
      <DaysSelect
        status={listingStatus}
        soldValue={soldWithin}
        daysValue={daysOnMarket}
        onChange={onChange}
      />
      <YearBuiltSelect
        from={minYearBuilt}
        to={maxYearBuilt}
        onChange={onChange}
      />
    </Stack>
  )
}

export default AdvancedFiltersTab
