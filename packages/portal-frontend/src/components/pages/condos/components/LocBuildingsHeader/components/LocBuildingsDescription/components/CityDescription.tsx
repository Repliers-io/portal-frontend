import React from 'react'

import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { LocationLink } from '@pages/locations/components/LocationHeader/components/LocationLink'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'
import { capitalize } from 'utils/strings'

import { Bold, LocationsList } from './formatters'

type Props = {
  cityCounts: Record<string, number>
}

export const CityDescription = ({ cityCounts }: Props) => {
  const { city, count, cities } = useLocationPage()
  const { onLinkFocus, onLinkBlur, onLinkClick } = useLocationMap()

  const citiesWithBuildings = cities
    .filter((c) => c.name !== city && (cityCounts[c.name] ?? 0) > 0)
    .sort((a, b) => (cityCounts[b.name] ?? 0) - (cityCounts[a.name] ?? 0))

  const otherCityLinks = citiesWithBuildings.map((c, index) => {
    const buildings = cityCounts[c.name] ?? 0
    return (
      <React.Fragment key={index}>
        <LocationLink
          city={c}
          basePrefix={routes.condos}
          onFocus={onLinkFocus}
          onBlur={onLinkBlur}
          onClick={onLinkClick}
        />
        {buildings >= 5 && (
          <>
            {' '}
            (<Bold>{buildings.toLocaleString('en-GB')}</Bold> buildings)
          </>
        )}
      </React.Fragment>
    )
  })

  return (
    <>
      <p>
        Discover
        {count > 0 && (
          <>
            {' '}
            <Bold>{count.toLocaleString('en-GB')}</Bold>
          </>
        )}{' '}
        condo buildings in <Bold>{capitalize(city!)}</Bold>.
      </p>
      {otherCityLinks.length > 0 && (
        <p>
          Other cities in <Bold>{locationConfig.state}</Bold> with condo
          buildings: <LocationsList items={otherCityLinks} />.
        </p>
      )}
    </>
  )
}
