import React from 'react'

import locationConfig from '@configs/location'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'

import { LocationLink } from '../../LocationLink'

import { Counter, LocationsList } from './formatters'

const { minSeoCityCount } = locationConfig

export const AreaDescription = () => {
  const { area, cities } = useLocationPage()
  const { onLinkFocus, onLinkBlur, onLinkClick } = useLocationMap()
  const Cities = cities
    .filter((city) => city.name) // exclude cities without name
    .map((city, index) => (
      <React.Fragment key={index}>
        <LocationLink
          city={city}
          onBlur={onLinkBlur}
          onFocus={onLinkFocus}
          onClick={onLinkClick}
        />
        {(city.activeCount ?? 0) >= minSeoCityCount && (
          <>
            {' '}
            (<Counter count={city.activeCount} /> listings)
          </>
        )}
      </React.Fragment>
    ))

  return (
    <p>
      Explore {area} real estate opportunities across these cities:{' '}
      <LocationsList items={Cities} />
    </p>
  )
}
