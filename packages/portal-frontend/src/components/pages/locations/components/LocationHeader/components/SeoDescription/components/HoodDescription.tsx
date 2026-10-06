import React from 'react'

import locationConfig from '@configs/location'

import { type ApiLocation } from 'services/API'
import { useLocationMap, useLocationPage } from 'providers/LocationProvider'

import { LocationLink } from '../../LocationLink'

import { Bold, Counter } from './formatters'

const { maxNearbies } = locationConfig

export const HoodDescription = () => {
  const { hood, city, count, nearbies } = useLocationPage()
  const { onLinkFocus, onLinkBlur, onLinkClick } = useLocationMap()
  if (!hood || !city) return null
  const nearby = nearbies
    .filter((n) => n.name !== hood && n.activeCount)
    .slice(0, maxNearbies)
  const cityLocation: ApiLocation = { type: 'city', name: city, locationId: '' }

  return (
    <>
      <p>
        <Bold>{hood}</Bold> is a neighborhood in <Bold>{city}</Bold> with{' '}
        <Counter count={count} /> active listings spanning a range of property
        types and price points.
      </p>
      {nearby.length > 0 && (
        <p>
          Nearby neighbourhoods:{' '}
          {nearby.map((hood, index) => (
            <React.Fragment key={hood.name}>
              <LocationLink
                city={cityLocation}
                hood={hood}
                onFocus={onLinkFocus}
                onBlur={onLinkBlur}
                onClick={onLinkClick}
              />
              {index < nearby.length - 1 ? ', ' : '.'}
            </React.Fragment>
          ))}
        </p>
      )}
    </>
  )
}
