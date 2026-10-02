import React from 'react'

import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { LocationLink } from '@pages/locations/components/LocationHeader/components/LocationLink'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'

import { Bold, LocationsList } from './formatters'

type Props = {
  cityCounts: Record<string, number>
}

export const StateDescription = ({ cityCounts }: Props) => {
  const { count, cities } = useLocationPage()
  const { onLinkFocus, onLinkBlur, onLinkClick } = useLocationMap()

  const citiesWithBuildings = cities
    .filter((c) => (cityCounts[c.name] ?? 0) > 0)
    .sort((a, b) => (cityCounts[b.name] ?? 0) - (cityCounts[a.name] ?? 0))

  const mainCity = citiesWithBuildings[0]
  const otherCities = citiesWithBuildings.slice(1)

  const otherCityLinks = otherCities.map((c, index) => {
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
        Explore
        {count > 0 && (
          <>
            {' '}
            <Bold>{count.toLocaleString('en-GB')}</Bold>
          </>
        )}{' '}
        condo buildings across <Bold>{locationConfig.state}</Bold>.
      </p>
      {mainCity && (
        <p>
          Among these,{' '}
          <LocationLink
            city={mainCity}
            basePrefix={routes.condos}
            onFocus={onLinkFocus}
            onBlur={onLinkBlur}
            onClick={onLinkClick}
          />{' '}
          stands out
          {(cityCounts[mainCity.name] ?? 0) >= 5 && (
            <>
              {' '}
              with{' '}
              <Bold>
                {cityCounts[mainCity.name].toLocaleString('en-GB')} buildings
              </Bold>
            </>
          )}
          {otherCityLinks.length > 0 && (
            <>
              , followed by <LocationsList items={otherCityLinks} />
            </>
          )}
          .
        </p>
      )}
    </>
  )
}
