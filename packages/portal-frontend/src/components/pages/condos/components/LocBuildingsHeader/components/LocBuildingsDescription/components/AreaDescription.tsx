import React from 'react'

import locationConfig from '@configs/location'
import routes from '@configs/routes'
import { LocationLink } from '@pages/locations/components/LocationHeader/components/LocationLink'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'
import { capitalize } from 'utils/strings'

import { Bold, LocationsList } from './formatters'

const { maxSeoCities } = locationConfig

export const AreaDescription = () => {
  const { area, count, cities } = useLocationPage()
  const { onLinkFocus, onLinkBlur, onLinkClick } = useLocationMap()

  const areaCityLinks = cities
    .slice(0, maxSeoCities)
    .map((c, index) => (
      <LocationLink
        key={index}
        city={c}
        basePrefix={routes.condos}
        variant={index === 0 ? 'primary' : 'secondary'}
        onFocus={onLinkFocus}
        onBlur={onLinkBlur}
        onClick={onLinkClick}
      />
    ))

  return (
    <p>
      Browse
      {count > 0 && (
        <>
          {' '}
          <Bold>{count.toLocaleString('en-GB')}</Bold>
        </>
      )}{' '}
      condo buildings in the <Bold>{capitalize(area!)}</Bold> area across these
      cities: <LocationsList items={areaCityLinks} />
    </p>
  )
}
