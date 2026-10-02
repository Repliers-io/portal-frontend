import React from 'react'

import locationConfig from '@configs/location'

import { useLocationMap, useLocationPage } from 'providers/LocationProvider'

import { LocationLink } from '../../LocationLink'

import { Bold, Counter, LocationsList } from './formatters'

const { majorCityFactor, maxSeoMajorCities } = locationConfig

export const StateDescription = () => {
  const { count, areas, cities } = useLocationPage()
  const { onLinkFocus, onLinkBlur, onLinkClick } = useLocationMap()
  // Identify the main city (city with the highest listing count)
  const mainCity = cities[0]

  // Find other major cities with at least majorCityFactor% of the main city's listings
  const majorCities = cities
    .filter(
      (city) =>
        city.activeCount &&
        mainCity.activeCount &&
        city.activeCount >= mainCity.activeCount * majorCityFactor
    )
    .slice(1, maxSeoMajorCities + 1)

  const Areas = areas.map((area, index) => (
    <LocationLink area={area} key={index} />
  ))

  const MajorCities = majorCities.map((city) => (
    <React.Fragment key={city.name}>
      <LocationLink
        city={city}
        onFocus={onLinkFocus}
        onBlur={onLinkBlur}
        onClick={onLinkClick}
      />{' '}
      (
      <Counter count={city.activeCount} /> listings)
    </React.Fragment>
  ))

  const Cities = cities
    .slice(1) // exclude the main city
    .filter((city) => !majorCities.includes(city))
    .slice(0, locationConfig.maxSeoCities)
    .map((city, index) => (
      <LocationLink
        key={index}
        city={city}
        variant="secondary"
        onBlur={onLinkBlur}
        onFocus={onLinkFocus}
        onClick={onLinkClick}
      />
    ))

  return (
    <>
      <p>
        <Bold>{locationConfig.state}</Bold> offers an impressive{' '}
        <Counter count={count} /> real estate listings across{' '}
        <Bold>{areas.length} areas</Bold> and{' '}
        <Bold>{cities.length} cities</Bold>, catering to a wide range of
        preferences and lifestyles. Key areas include{' '}
        <LocationsList items={Areas} />, each contributing to the rich variety
        of real estate opportunities.
      </p>
      <p>
        Among these,{' '}
        <LocationLink
          city={mainCity}
          onBlur={onLinkBlur}
          onFocus={onLinkFocus}
          onClick={onLinkClick}
        />{' '}
        stands out with <Counter count={mainCity.activeCount} /> listings
        {majorCities.length > 1 && (
          <>
            , followed by other prominent cities like{' '}
            <LocationsList items={MajorCities} />
          </>
        )}
        . Whether you&apos;re seeking a family home, investment listing, or
        rental, <Bold>{locationConfig.state}</Bold> provides diverse housing
        options to meet every need.
      </p>
      <p>
        Other available cities in <Bold>{locationConfig.state}</Bold> include{' '}
        <LocationsList items={Cities} />.
      </p>
    </>
  )
}
