import { Stack, Typography } from '@mui/material'

import { type ApiSavedSearch } from 'services/API'
import { getListingType } from 'services/Search'
import { joinNonEmpty } from 'utils/strings'

import {
  getMinBedrooms,
  getPriceRange,
  getSearchLabel,
  getYearBuiltRange
} from '../utils'

const clampSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical'
}

const nameLengthLimit = 50

const SavedSearchFilters = ({ search }: { search: ApiSavedSearch }) => {
  const {
    name,
    type,
    minPrice,
    maxPrice,
    minBeds, // `minBeds` in SavedSearch API, but `minBedrooms` in filters
    minBaths,
    minGarageSpaces,
    minParkingSpaces,
    minYearBuilt,
    maxYearBuilt,
    propertyTypes
  } = search

  const nameString = name.length === nameLengthLimit ? `${name}...` : name

  const listingType = getListingType(propertyTypes) || 'allListings'
  const searchLabel = getSearchLabel(listingType, type)
  const priceRange = getPriceRange(minPrice, maxPrice)
  const minBedroomsString = getMinBedrooms(minBeds) // additional formatter for studio apartments
  const yearBuiltRange = getYearBuiltRange(minYearBuilt, maxYearBuilt)

  const searchFilters = joinNonEmpty(
    [
      searchLabel,
      priceRange,
      minBedroomsString,
      minBaths && `${minBaths}+ Bathrooms`,
      minGarageSpaces && `${minGarageSpaces}+ Garage Spaces`,
      minParkingSpaces && `${minParkingSpaces}+ Parking Spaces`,
      yearBuiltRange
    ],
    ', '
  )

  return (
    <Stack spacing={1}>
      <Typography
        variant="h6"
        title={nameString}
        sx={{
          maxHeight: 48,
          WebkitLineClamp: 2,
          ...clampSx
        }}
      >
        {nameString}
      </Typography>
      <Typography
        title={searchFilters}
        variant="body2"
        sx={{
          maxHeight: 60,
          WebkitLineClamp: 3,
          ...clampSx
        }}
      >
        {searchFilters}
      </Typography>
    </Stack>
  )
}

export default SavedSearchFilters
