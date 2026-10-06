import { type PopularSearch } from '@defaults/location'

import { useLocationPage } from 'providers/LocationProvider'

import {
  CitiesOfRegion,
  HoodsOfCity,
  NearbyLocations,
  PopularSearches
} from '.'

export const LocationFooter = ({
  searches
}: {
  searches?: PopularSearch[] | null
}) => {
  const { city, hood, cities, hoods, nearbies } = useLocationPage()

  return (
    <>
      {cities.length > 0 && <CitiesOfRegion cities={cities} />}
      {city && hoods.length > 0 && <HoodsOfCity hoods={hoods} city={city} />}
      {nearbies.length > 0 && (
        <NearbyLocations locations={nearbies} city={city} hood={hood} />
      )}
      <PopularSearches
        withLocation
        city={city}
        hood={hood}
        filtersList={searches}
      />
    </>
  )
}
