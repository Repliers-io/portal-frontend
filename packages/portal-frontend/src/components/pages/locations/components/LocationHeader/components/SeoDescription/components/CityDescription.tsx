import React from 'react'

import locationConfig from '@configs/location'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'

import { LocationLink } from '../../LocationLink'

import { Bold, Counter, LocationsList } from './formatters'

const { maxSeoHoodsWithCount, minSeoHoodCount } = locationConfig

export const CityDescription = () => {
  const { city, hoods, location } = useLocationPage()
  const { onLinkFocus, onLinkBlur, onLinkClick } = useLocationMap()
  const Hoods = hoods.map((hood, index) => {
    // Show count only for first N neighborhoods and only if count >= minSeoHoodCount
    const showCount =
      index < maxSeoHoodsWithCount && (hood.activeCount ?? 0) >= minSeoHoodCount

    return (
      <React.Fragment key={index}>
        <LocationLink
          city={location}
          hood={hood}
          onBlur={onLinkBlur}
          onFocus={onLinkFocus}
          onClick={onLinkClick}
        />
        {showCount && (
          <>
            {' '}
            (<Counter count={hood.activeCount} /> listings)
          </>
        )}
      </React.Fragment>
    )
  })

  if (!hoods.length) return null

  return (
    <p>
      Discover <Bold>{city}</Bold> diverse neighborhoods, each offering unique
      character and lifestyle: <LocationsList items={Hoods} />
    </p>
  )
}
