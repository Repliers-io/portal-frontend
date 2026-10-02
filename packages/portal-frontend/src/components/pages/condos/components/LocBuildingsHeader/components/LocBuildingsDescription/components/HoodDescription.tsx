import React from 'react'

import routes from '@configs/routes'
import { LocationLink } from '@pages/locations/components/LocationHeader/components/LocationLink'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'
import { capitalize } from 'utils/strings'
import { sanitizeUrl } from 'utils/urls'

import { Bold, LocationsList } from './formatters'

type Props = {
  hoodCounts: Record<string, number>
}

export const HoodDescription = ({ hoodCounts }: Props) => {
  const { area, city, hood, count, hoods } = useLocationPage()
  const { onLinkFocus, onLinkBlur, onLinkClick } = useLocationMap()

  const hoodsWithBuildings = hoods
    .filter((h) => h.name !== hood && (hoodCounts[h.name] ?? 0) > 0)
    .sort((a, b) => (hoodCounts[b.name] ?? 0) - (hoodCounts[a.name] ?? 0))

  const otherHoodLinks = hoodsWithBuildings.map((h, index) => {
    const buildings = hoodCounts[h.name] ?? 0
    return (
      <React.Fragment key={index}>
        <LocationLink
          city={h}
          basePrefix={
            city ? `${routes.condos}/${sanitizeUrl(city)}` : routes.condos
          }
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
        condo buildings in <Bold>{capitalize(hood!)}</Bold>
        {city && (
          <>
            , <Bold>{capitalize(city)}</Bold>
          </>
        )}
        .
      </p>
      {otherHoodLinks.length > 0 && (
        <p>
          Other neighbourhoods in <Bold>{capitalize(city ?? area ?? '')}</Bold>{' '}
          with condo buildings: <LocationsList items={otherHoodLinks} />.
        </p>
      )}
    </>
  )
}
