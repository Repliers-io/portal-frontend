'use client'

import { Stack } from '@mui/material'

import { LocationMap } from '@pages/locations/components/LocationHeader/components/LocationMap'

import MapOptionsProvider from 'providers/MapOptionsProvider'

import { LocBuildingsBreadcrumbs } from '../LocBuildingsBreadcrumbs'

import { LocBuildingsDescription, LocBuildingsTitle } from './components'

type Props = {
  cityCounts: Record<string, number>
  hoodCounts: Record<string, number>
  markers?: {
    latitude: number
    longitude: number
    link: string
    name?: string
    address?: string
    imageUrl?: string
  }[]
}

export const LocBuildingsHeader = ({
  cityCounts,
  hoodCounts,
  markers
}: Props) => (
  <Stack spacing={{ xs: 2, sm: 4 }}>
    <LocBuildingsBreadcrumbs />

    <MapOptionsProvider layout="map" style="map">
      <Stack width="100%" spacing={{ xs: 2, sm: 4 }}>
        <LocBuildingsTitle />

        <Stack spacing={2}>
          <LocBuildingsDescription
            cityCounts={cityCounts}
            hoodCounts={hoodCounts}
          />
          <LocationMap markers={markers} />
        </Stack>
      </Stack>
    </MapOptionsProvider>
  </Stack>
)
