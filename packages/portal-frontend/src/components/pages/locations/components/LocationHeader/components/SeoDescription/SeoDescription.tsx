import React from 'react'

import { Typography } from '@mui/material'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'

import {
  AreaDescription,
  CityDescription,
  HoodDescription,
  StateDescription
} from './components'

export const SeoDescription = () => {
  const { area, city, hood, cities } = useLocationPage()
  const { onLinkBlur } = useLocationMap()

  // Early return if no data — allow hood pages even when cities list is empty.
  // Deliberately NOT gated on the catalog count: this block is built from the
  // server-passed cities and their own activeCount, so a failed or empty listings
  // query must not erase it (the buildings catalog gates the same way).
  if (!cities.length && !hood) return null

  return (
    <Typography
      variant="body2"
      component="div"
      color="text.secondary"
      onMouseLeave={onLinkBlur}
      sx={{
        '& p:first-of-type': { mt: 0 },
        '& p:last-of-type': { mb: 0 },
        pb: { xs: 1, sm: 0 }
      }}
    >
      {!area && !city && <StateDescription />}
      {area && !city && <AreaDescription />}
      {city && !hood && <CityDescription />}
      {city && hood && <HoodDescription />}
    </Typography>
  )
}
