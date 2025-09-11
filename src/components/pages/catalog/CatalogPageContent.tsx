import React from 'react'

import { Box, Container, Stack } from '@mui/material'

import { gridSpacing } from '@configs/cards-grids'
// TODO: fix constants import from @pages alias
import { gridColumnsMediaQueries } from '@pages/search/components/MapRoot/constants'
import { EmptyCatalogListings } from '@shared/EmptyStates'
import { PropertyCard } from '@shared/Property'

import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood,
  type Property
} from 'services/API'
import type { Filters } from 'services/Search'
import MapOptionsProvider from 'providers/MapOptionsProvider'

import {
  Breadcrumbs,
  CatalogFilters,
  CatalogHeader,
  CatalogPagination,
  // CitiesOfRegion,
  FiltersList,
  // HoodsOfCity,
  // PopularCities,
  // PopularHoods,
  PopularSearches
} from './components'

const CatalogPageContent = ({
  page,
  count,
  listings,
  area,
  hood,
  city,
  urlFilters,
  searchFilters,
  areas,
  hoods,
  cities,
  location
}: {
  listings: Property[]
  count: number
  page: number

  area?: string
  hood?: string
  city?: string

  areas: ApiBoardArea[]
  hoods: ApiNeighborhood[]
  cities: ApiBoardCity[]
  location?: ApiBoardCity | ApiNeighborhood
  // nearbyLocations: ApiBoardCity[]

  urlFilters: string[]
  searchFilters: Partial<Filters>
}) => {
  return (
    <MapOptionsProvider layout="map" style="map">
      <Box minHeight="calc(100vh - 72px)">
        <Box sx={{ boxShadow: count > 0 ? 1 : 0 }}>
          <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 3 } }}>
            <CatalogHeader
              count={count}
              area={area}
              city={city}
              hood={hood}
              areas={areas}
              cities={cities}
              hoods={hoods}
              location={location}
            />
            <CatalogFilters
              count={count}
              city={city}
              hood={hood}
              searchFilters={searchFilters}
            />
          </Container>
        </Box>

        <Container
          disableGutters
          sx={{
            ...gridColumnsMediaQueries,
            px: gridSpacing,
            pt: gridSpacing
          }}
        >
          {listings?.length > 0 ? (
            <Stack spacing={4} direction="row" flexWrap="wrap">
              {listings.map((property, index) => (
                <PropertyCard key={index} property={property} />
              ))}
            </Stack>
          ) : (
            <EmptyCatalogListings />
          )}
          <Stack spacing={2} alignItems="center" py={4}>
            <CatalogPagination page={page} count={count} />
            {count > 0 && <Breadcrumbs city={city} hood={hood} />}

            <FiltersList urlFilters={urlFilters} />
          </Stack>
        </Container>

        {/* <CitiesOfRegion /> */}
        {/* <HoodsOfCity /> */}
        {/* <PopularCities /> */}
        {/* <PopularHoods /> */}
        <PopularSearches city={city} hood={hood} />
      </Box>
    </MapOptionsProvider>
  )
}

export default CatalogPageContent
