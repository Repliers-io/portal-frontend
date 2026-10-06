import { formatShortPrice } from 'utils/formatters'
import { beautify } from 'utils/urls'

import {
  condoValues,
  filterSuffixes,
  residentialValues,
  typePrefixes,
  typeValues
} from './constants'
import { parseUrlNumber, parseUrlPrice } from './parsers'
const shortSuffixLabel = (suffix: string): string => {
  if (['bed', 'beds', 'bedroom', 'bedrooms'].includes(suffix)) return 'Beds'
  if (['bath', 'baths', 'bathroom', 'bathrooms'].includes(suffix))
    return 'Baths'
  if (['garage', 'garages'].includes(suffix)) return 'Garage'
  return 'Parking'
}

const listingTypeLabel = (filter: string): string => {
  if (filter === 'detached') return 'Detached Homes'
  if (filter === 'semi') return 'Semi-Detached Homes'
  return beautify(filter)
}

export const getCatalogTitle = (filters: string[]) => {
  const saleType =
    filters.find((f) => f === 'active') ||
    filters.find((f) => f === 'sold') ||
    filters.find((f) => ['for-sale', 'for-rent'].includes(f))

  const typePrefixString = filters
    .filter((f) => typePrefixes.some((p) => f === p))
    .map(beautify)
    .join(' ')

  const listingTypes = filters.filter((f) =>
    [...typeValues, ...condoValues, ...residentialValues].includes(f)
  )
  const listingTypeWord = listingTypes.length
    ? listingTypes.map(listingTypeLabel).join(' ')
    : 'Listings'

  const typeString = [typePrefixString, listingTypeWord]
    .filter(Boolean)
    .join(' ')

  const countFilters = filters.filter((f) =>
    filterSuffixes.some((s) => f.endsWith(s))
  )
  const countString = countFilters
    .map((f) => {
      const n = parseUrlNumber(f)
      const suffix = filterSuffixes.find((s) => f.endsWith(s))!
      return `${n}+ ${shortSuffixLabel(suffix)}`
    })
    .join(', ')

  const maxPriceFilter = filters.find(
    (f) => f.startsWith('below-') || f.startsWith('under-')
  )
  const minPriceFilter = filters.find((f) => f.startsWith('above-'))
  const priceString = [
    minPriceFilter &&
      `above ${formatShortPrice(parseUrlPrice(minPriceFilter))}`,
    maxPriceFilter && `under ${formatShortPrice(parseUrlPrice(maxPriceFilter))}`
  ]
    .filter(Boolean)
    .join(', ')

  const saleTypeSuffix =
    saleType === 'for-rent'
      ? ' for Rent'
      : saleType === 'for-sale'
        ? ' for Sale'
        : ''
  const saleTypePrefix =
    saleType && ['active', 'sold'].includes(saleType)
      ? `${beautify(saleType)} `
      : ''

  let result = typeString
  if (countString) result += `, ${countString}`
  if (priceString)
    result += countString ? `, ${priceString}` : ` ${priceString}`

  return `${saleTypePrefix}${result}${saleTypeSuffix}`
}

export function buildLocationMeta(
  locationLabel: string,
  catalogTitle: string,
  state: string,
  descriptionSuffix: string
): { title: string; description: string } {
  const title = [locationLabel, catalogTitle].filter(Boolean).join(' ')
  const description = [
    `Browse ${catalogTitle}`,
    locationLabel !== state ? `in ${locationLabel}` : ''
  ]
    .filter(Boolean)
    .join(' ')
    .concat(descriptionSuffix)
  return { title, description }
}
