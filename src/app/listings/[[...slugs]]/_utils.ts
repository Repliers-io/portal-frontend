import {
  type ApiBoardArea,
  type ApiBoardCity,
  type ApiNeighborhood
} from 'services/API'
import { formatEnglishPrice } from 'utils/formatters'
import { type Location } from 'utils/geo'
import { joinNonEmpty } from 'utils/strings'

import {
  condoValues,
  filterSuffixes,
  priceFilterPrefixes,
  residentialValues,
  typePrefixes,
  typeValues
} from './_constants'
import { beautify, parseUrlPrice } from './_parsers'
import { type CatalogItem } from './_requests'

export const aggregateAndRemoveDuplicates = (
  array: (ApiBoardCity | ApiNeighborhood)[]
) => {
  const aggregated = array.reduce(
    (acc, el) => {
      if (acc[el.name]) {
        acc[el.name].activeCount += el.activeCount
      } else {
        acc[el.name] = { ...el }
      }
      return acc
    },
    {} as Record<string, any>
  )
  return Object.values(aggregated)
}

export const extractHoods = (areas: any): ApiNeighborhood[] => {
  return aggregateAndRemoveDuplicates(
    areas.flatMap((area: ApiBoardArea) => {
      return area.cities.flatMap((city: ApiBoardCity) => city.neighborhoods)
    })
  )
}

export const extractCities = (areas: any): ApiBoardCity[] => {
  return aggregateAndRemoveDuplicates(
    areas.flatMap((area: ApiBoardArea) => {
      return area.cities.map((city: ApiBoardCity) => ({
        ...city,
        neighborhoods: []
      }))
    })
  )
}

export const extractLocation = (
  areas: any,
  city: string,
  neighborhood?: string
): ApiBoardCity | ApiNeighborhood | undefined => {
  if (neighborhood) {
    // return areas[0].cities // WARN: ERROR: BUG: there are more than one area
    //   .flatMap((city: any) => city.neighborhoods || [])
    //   .find((hood: CatalogItem) => hood.name === neighborhood)
  } else {
    return areas.reduce((acc: CatalogItem, area: ApiBoardArea) => {
      const cityItem = area.cities.find(
        (item: ApiBoardCity) => item.name.toLowerCase() === city.toLowerCase()
      )
      return cityItem || acc
    })
  }
}

const toRad = (degrees: number) => degrees * (Math.PI / 180)

export const calculateDistance = (location1: Location, location2: Location) => {
  if (!location1 || !location2) return 9999999

  const R = 6371 // Earth radius in km
  const dLat = toRad(location2.lat - location1.lat)
  const dLon = toRad(location2.lng - location1.lng)
  const lat1 = toRad(location1.lat)
  const lat2 = toRad(location2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

export const byCount = (a: CatalogItem, b: CatalogItem) =>
  b.activeCount - a.activeCount

export const byDistance = (item1: CatalogItem, item2: CatalogItem) =>
  item1.distance! > item2.distance! ? 1 : -1

export const getCatalogTitle = (filters: string[]) => {
  const saleType =
    filters.find((filter) => filter === 'active') ||
    filters.find((filter) => filter === 'sold') ||
    filters.find((filter) => ['for-sale', 'for-rent'].includes(filter)) ||
    'for-sale'

  // check if we have property/listing type description in the url
  const listingTypes = filters.filter((filter) =>
    [...typeValues, ...condoValues, ...residentialValues].includes(filter)
  )

  // extract the filters with some counts / amounts / numbers in them
  const countFilters = filters.filter((filter) =>
    filterSuffixes.some((suffix) => filter.endsWith(suffix))
  )

  const priceFilters = filters.filter((filter) =>
    priceFilterPrefixes.some((prefix) => filter.startsWith(prefix))
  )

  const typePrefixString = filters
    .filter((filter) => typePrefixes.some((prefix) => filter === prefix))
    .map(beautify)
    .join(' ')

  // join all the listing types with spaces or use default value
  const listingTypeString = [
    typePrefixString,
    listingTypes.length ? listingTypes.map(beautify).join(' ') : 'Listings'
  ].join(' ')

  // join all the filters with commas
  const filtersString =
    countFilters.length || priceFilters.length
      ? ` with ${[
          ...priceFilters.map((item) => {
            const [prefix, price] = item.split('-')
            const formattedPrice = formatEnglishPrice(parseUrlPrice(price))
            return `Price ${prefix} ${formattedPrice}`
          }),
          ...countFilters.map(beautify)
        ].join(', ')}`
      : ''

  // extract sale type
  const saleTypeSuffix = saleType?.startsWith('for-')
    ? ` ${beautify(saleType)}`
    : ''
  const saleTypePrefix = ['active', 'sold'].includes(saleType || '')
    ? beautify(saleType!)
    : ''

  const catalogTitle = `${saleTypePrefix}${listingTypeString}${filtersString}${saleTypeSuffix}`

  return catalogTitle
}

export const getCatalogLocation = (
  city: string,
  neighborhood: string,
  full = false
) => {
  return full
    ? joinNonEmpty([neighborhood, city, 'Ontario', 'ON'], ', ')
    : [neighborhood, city, 'Ontario'].filter(Boolean)[0]
}
