'use client'

import { Stack } from '@mui/material'

import { type Filters } from 'services/Search'
import MapOptionsProvider from 'providers/MapOptionsProvider'

import { LocationBreadcrumbs } from '..'

import { LocationMap, LocationTitle, SeoDescription } from './components'

type LocationHeaderProps = {
  filters: Partial<Filters>
  urlFilters: string[]
}

export const LocationHeader = ({
  filters,
  urlFilters
}: LocationHeaderProps) => {
  return (
    <Stack spacing={{ xs: 2, sm: 4 }}>
      <LocationBreadcrumbs />

      <MapOptionsProvider layout="map" style="map">
        <Stack width="100%" spacing={{ xs: 2, sm: 4 }}>
          <LocationTitle filters={filters} urlFilters={urlFilters} />

          <Stack spacing={2}>
            <SeoDescription />
            <LocationMap />
          </Stack>
        </Stack>
      </MapOptionsProvider>
    </Stack>
  )
}
