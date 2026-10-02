'use client'

import { Box, Container, Grid, Stack } from '@mui/material'

import locationConfig from '@configs/location'

import { type EnrichedBuilding } from 'app/condos/_utils'

import { type ApiLocation } from 'services/API'
import { LocationProvider } from 'providers/LocationProvider'
import { getBuildingName } from 'utils/buildings'
import { capitalize } from 'utils/strings'
import { getCDNPath } from 'utils/urls'

import {
  BuildingsEmptyState,
  BuildingsPagination,
  LocBuildingCard,
  LocBuildingsFooter,
  LocBuildingsHeader
} from './components'
import {
  getBuildingSubtitle,
  getBuildingUrl,
  getLocationBuildingsUrl
} from './utils'

export interface LocBuildingsIndexProps {
  area?: string
  city?: string
  hood?: string
  page: number
  buildings: EnrichedBuilding[]
  count: number
  numPages: number
  cityCounts: Record<string, number>
  hoodCounts: Record<string, number>
  cities: ApiLocation[]
  hoods: ApiLocation[]
  location?: ApiLocation
}

export const LocBuildingsIndexPageContent = ({
  area,
  city,
  hood,
  page,
  count,
  buildings,
  numPages,
  cityCounts,
  hoodCounts,
  cities,
  hoods,
  location
}: LocBuildingsIndexProps) => {
  const locationLabel = hood
    ? city
      ? `${capitalize(hood)}, ${capitalize(city)}`
      : capitalize(hood)
    : city
      ? capitalize(city)
      : area
        ? `${capitalize(area)} Area`
        : locationConfig.state

  const baseUrl = getLocationBuildingsUrl({ area, city, hood })

  const buildingMarkers = buildings
    .filter((b) => b.map?.latitude && b.map?.longitude)
    .map((b) => {
      const { streetNumber, streetName } = b.address || {}
      const streetAddress = [streetNumber, streetName].filter(Boolean).join(' ')
      const properName = getBuildingName(b)
      const hasName = Boolean(properName)
      const name = hasName ? properName! : streetAddress
      const address = getBuildingSubtitle(b.address, hasName)
      const imageUrl =
        b.cmsImageUrl ?? (b.image ? getCDNPath(b.image, 'medium') : undefined)

      return {
        latitude: parseFloat(b.map!.latitude!),
        longitude: parseFloat(b.map!.longitude!),
        link: getBuildingUrl(b, { area, city, hood }),
        name,
        address,
        imageUrl
      }
    })

  return (
    <LocationProvider
      area={area}
      city={city}
      hood={hood}
      count={count}
      location={location}
      areas={[]}
      cities={cities}
      hoods={hoods}
    >
      <Box bgcolor="background.paper">
        <Container sx={{ pt: 2, pb: 0 }} maxWidth="lg">
          <Stack spacing={4}>
            <LocBuildingsHeader
              cityCounts={cityCounts}
              hoodCounts={hoodCounts}
              markers={buildingMarkers}
            />

            {buildings.length > 0 ? (
              <Grid container spacing={4}>
                {buildings.map((building, index) => (
                  <Grid
                    key={
                      building.address?.addressKey || `page-${page}-${index}`
                    }
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  >
                    <LocBuildingCard
                      building={building}
                      area={area}
                      city={city}
                      hood={hood}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <BuildingsEmptyState location={locationLabel} />
            )}

            <BuildingsPagination
              currentPage={page}
              numPages={numPages}
              baseUrl={baseUrl}
            />

            <LocBuildingsFooter cityCounts={cityCounts} />
          </Stack>
        </Container>
      </Box>
    </LocationProvider>
  )
}
