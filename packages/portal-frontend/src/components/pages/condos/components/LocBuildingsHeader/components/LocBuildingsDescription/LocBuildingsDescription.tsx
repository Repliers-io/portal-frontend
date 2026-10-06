'use client'

import { Typography } from '@mui/material'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'

import {
  AreaDescription,
  CityDescription,
  HoodDescription,
  StateDescription
} from './components'

type Props = {
  cityCounts: Record<string, number>
  hoodCounts: Record<string, number>
}

export const LocBuildingsDescription = ({ cityCounts, hoodCounts }: Props) => {
  const { area, city, hood, cities } = useLocationPage()
  const { onLinkBlur } = useLocationMap()

  if (!cities.length && !hood) return null

  return (
    <Typography
      variant="body2"
      component="div"
      color="text.secondary"
      onMouseLeave={onLinkBlur}
      sx={{ '& p:first-of-type': { mt: 0 }, '& p:last-of-type': { mb: 0 } }}
    >
      {hood && <HoodDescription hoodCounts={hoodCounts} />}
      {!hood && city && <CityDescription cityCounts={cityCounts} />}
      {!hood && !city && !area && <StateDescription cityCounts={cityCounts} />}
      {!hood && area && !city && <AreaDescription />}
    </Typography>
  )
}
