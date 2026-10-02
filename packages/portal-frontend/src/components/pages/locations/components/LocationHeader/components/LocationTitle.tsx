'use client'

import { useTranslations } from 'next-intl'

import { Button, Stack, Typography } from '@mui/material'

import features from '@configs/features'
import { ApartmentIcon, ExploreIcon, TrendingUpIcon } from '@configs/icons'
import routes from '@configs/routes'
import { getLocationBuildingsUrl } from '@pages/condos/utils'

import { getCatalogTitle } from 'app/locations/[[...slugs]]/_utils'

import { type Filters } from 'services/Search'
import { useLocationPage } from 'providers/LocationProvider'
import { sanitizeUrl } from 'utils/urls'

import { getLocationMapUrl } from '../utils'

export interface LocationTitleProps {
  filters: Partial<Filters>
  urlFilters: string[]
}

export const LocationTitle = ({ filters, urlFilters }: LocationTitleProps) => {
  const { area, city, locationName, location, cityHasBuildings } =
    useLocationPage()
  const t = useTranslations('LocationHeader')
  const mapLink = getLocationMapUrl(location)

  const insightsCity = city
  const insightsLink = insightsCity
    ? `${routes.dashboard}/${sanitizeUrl(insightsCity)}`
    : routes.dashboard
  const insightsLabel = insightsCity
    ? t('cityInsights', { city: insightsCity })
    : t('marketInsights')

  const buildingsLink = getLocationBuildingsUrl(
    city ? { city } : area ? { area } : undefined
  )

  const buttonSx = {
    mb: -1,
    height: '38px',
    whiteSpace: 'nowrap',
    display: 'inline-flex'
  }

  const titleText =
    urlFilters.length > 0
      ? getCatalogTitle(urlFilters)
      : t('title', {
          listingType: [filters.listingType].flat()[0] || 'allListings',
          listingStatus: [filters.listingStatus].flat()[0] || 'active'
        })

  return (
    <Stack
      direction="row"
      spacing={2}
      flexWrap="wrap"
      justifyContent="space-between"
    >
      <Typography variant="h2" component="h1">
        {locationName} {titleText}
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 1.5 }}
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        {features.dashboard && (
          <Button
            href={insightsLink}
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            sx={buttonSx}
          >
            {insightsLabel}
          </Button>
        )}
        {features.buildings && (!city || cityHasBuildings) && (
          <Button
            href={buildingsLink}
            variant="outlined"
            startIcon={<ApartmentIcon />}
            sx={buttonSx}
          >
            {t('exploreBuildings')}
          </Button>
        )}
        <Button
          href={mapLink}
          target="_blank"
          variant="outlined"
          startIcon={<ExploreIcon />}
          sx={buttonSx}
        >
          {t('exploreMap')}
        </Button>
      </Stack>
    </Stack>
  )
}
