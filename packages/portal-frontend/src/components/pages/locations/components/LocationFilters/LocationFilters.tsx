'use client'

import { Box, Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { type ListingType } from '@configs/filters'
import { ListingsCounter, SortModesSelect } from '@shared/Filters'

import { type ApiSortBy } from 'services/API'
import { type Filters } from 'services/Search'
import { useLocationPage } from 'providers/LocationProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import { getLocationUrl } from 'utils/urls'

import {
  FiltersSkeleton,
  FiltersSkeletonMobile,
  TypeStatusGroup
} from './components'

// Listing-type keys whose URL slug differs from the type name. The route parser
// (parseListingType) only recognises the slug form on the way back, so the URL
// must be written in that form — otherwise the type is dropped on navigation.
const typeSlugs: Partial<Record<string, string>> = {
  condo: 'condos',
  penthouse: 'penthouses',
  loft: 'lofts'
}

// Status → URL slug. Written for every navigable status (not just rent) so the
// current status survives a sort/type change instead of falling back to default.
const statusSlugs: Partial<Record<string, string>> = {
  active: 'for-sale',
  rent: 'for-rent'
}

export const LocationFilters = ({
  loading,
  filters
}: {
  loading?: boolean
  filters: Partial<Filters>
}) => {
  const { count, city, hood } = useLocationPage()
  const clientSide = useClientSide()
  const { mobile, tablet } = useBreakpoints()
  const size = mobile ? 'small' : 'medium'
  const stacked = mobile || tablet

  const { gridSpacing, listingCardSizes } = gridConfig
  const stackedMaxWidth =
    Number(listingCardSizes.medium.width) * 2 + gridSpacing * 8

  const { listingStatus, listingType, sortBy } = filters

  const createFiltersArray = ({
    type = listingType || 'allListings',
    status = listingStatus,
    sort = sortBy
  }) => {
    const filters: string[] = []

    const types = Array.isArray(type) ? type : [type]
    types.forEach((t) => {
      if (t !== 'allListings') filters.push(typeSlugs[t] ?? t)
    })

    const statuses = Array.isArray(status) ? status : status ? [status] : []
    statuses.forEach((s) => {
      const slug = statusSlugs[s]
      if (slug) filters.push(slug)
    })

    if (sort !== 'createdOnDesc') filters.push('sort-' + sort)

    return filters
  }

  const handleTypeChange = (value: ListingType | ListingType[]) => {
    const filters = createFiltersArray({ type: value })
    window.location.href = getLocationUrl({ city, hood, filters })
  }

  const handleSortChange = (value: ApiSortBy) => {
    const filters = createFiltersArray({ sort: value })
    window.location.href = getLocationUrl({ city, hood, filters })
  }

  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      {!clientSide || loading ? (
        <>
          <Box sx={{ display: { xs: 'none', md: 'contents' } }}>
            <FiltersSkeleton />
          </Box>
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              width: '100%',
              maxWidth: stackedMaxWidth,
              mx: 'auto'
            }}
          >
            <FiltersSkeletonMobile maxWidth={stackedMaxWidth} />
          </Box>
        </>
      ) : (
        <>
          {stacked ? (
            /* Mobile + tablet: two-row layout */
            <Stack
              spacing={1}
              sx={{ width: '100%', maxWidth: stackedMaxWidth, mx: 'auto' }}
            >
              {/* Row 1: type + status, centered */}
              <Stack direction="row" justifyContent="center">
                <TypeStatusGroup
                  size={size}
                  listingType={listingType}
                  listingStatus={listingStatus}
                  city={city}
                  hood={hood}
                  onTypeChange={handleTypeChange}
                  createFiltersArray={createFiltersArray}
                />
              </Stack>

              {/* Row 2: counter left, sort right */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <ListingsCounter count={count} />
                <SortModesSelect
                  filters={filters}
                  onChange={handleSortChange}
                />
              </Stack>
            </Stack>
          ) : (
            /* Desktop: single-row layout */
            <>
              <Box sx={{ minWidth: { md: 218 } }}>
                <ListingsCounter count={count} />
              </Box>

              <TypeStatusGroup
                size={size}
                city={city}
                hood={hood}
                listingType={listingType}
                listingStatus={listingStatus}
                onTypeChange={handleTypeChange}
                createFiltersArray={createFiltersArray}
              />

              <Box
                sx={{
                  display: 'flex',
                  minWidth: { md: 218 },
                  justifyContent: 'flex-end'
                }}
              >
                <SortModesSelect
                  filters={filters}
                  onChange={handleSortChange}
                />
              </Box>
            </>
          )}
        </>
      )}
    </Stack>
  )
}
