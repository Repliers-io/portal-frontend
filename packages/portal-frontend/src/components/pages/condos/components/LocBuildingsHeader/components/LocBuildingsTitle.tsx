'use client'

import { useTranslations } from 'next-intl'

import { Button, Stack, Typography } from '@mui/material'

import features from '@configs/features'
import { ExploreIcon, HomeOutlinedIcon, TrendingUpIcon } from '@configs/icons'
import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { getLocationMapUrl } from '@pages/locations/components/LocationHeader/utils'

import { useLocationPage } from 'providers/LocationProvider'
import { capitalize } from 'utils/strings'
import { getLocationUrl, sanitizeUrl } from 'utils/urls'

export const LocBuildingsTitle = () => {
  const { area, city, hood, location } = useLocationPage()
  const t = useTranslations()

  const locationLabel = hood
    ? city
      ? `${capitalize(hood)}, ${capitalize(city)}`
      : capitalize(hood)
    : city
      ? capitalize(city)
      : area
        ? `${capitalize(area)} Area`
        : locationConfig.state

  const title = t('Buildings.titleIn', { location: locationLabel })

  // On hood pages the full "Hood, City" label makes the title too wide and
  // pushes the action buttons to a new line. Render hood and city on separate
  // lines to keep the header balanced.
  const titleNode =
    hood && city ? (
      <>
        {t('Buildings.titleIn', { location: capitalize(hood) })},
        <br />
        {capitalize(city)}
      </>
    ) : (
      title
    )

  const insightsLink = city
    ? `${routes.dashboard}/${sanitizeUrl(city)}`
    : routes.dashboard
  const insightsLabel = city
    ? t('LocationHeader.cityInsights', { city })
    : t('LocationHeader.marketInsights')

  const listingsLink = getLocationUrl({ area, city, hood })

  const mapLink = getLocationMapUrl(location)

  const buttonSx = {
    mb: -1,
    height: '38px',
    whiteSpace: 'nowrap',
    display: 'inline-flex'
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      flexWrap="wrap"
      justifyContent="space-between"
    >
      <Typography variant="h2">{titleNode}</Typography>

      <Stack
        spacing={{ xs: 2, sm: 1.5 }}
        direction={{ xs: 'column', sm: 'row' }}
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
        <Button
          href={listingsLink}
          variant="outlined"
          startIcon={<HomeOutlinedIcon />}
          sx={buttonSx}
        >
          {t('LocationHeader.exploreListings')}
        </Button>
        <Button
          href={mapLink}
          target="_blank"
          variant="outlined"
          startIcon={<ExploreIcon />}
          sx={buttonSx}
        >
          {t('LocationHeader.exploreMap')}
        </Button>
      </Stack>
    </Stack>
  )
}
