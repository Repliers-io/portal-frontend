'use client'

import locationConfig from '@configs/location'
import routes from '@configs/routes'

import { CitiesOfRegion } from 'components/pages/locations/components'

import { useLocationPage } from 'providers/LocationProvider'

const { maxSeoCities } = locationConfig

type Props = {
  cityCounts: Record<string, number>
}

export const LocBuildingsFooter = ({ cityCounts }: Props) => {
  const { cities } = useLocationPage()
  const footerCities = cities
    .filter((c) => (cityCounts[c.name] ?? 0) > 0)
    .sort((a, b) => (cityCounts[b.name] ?? 0) - (cityCounts[a.name] ?? 0))
    .slice(0, maxSeoCities)

  if (!footerCities.length) return <div />

  return <CitiesOfRegion cities={footerCities} basePrefix={routes.condos} />
}
