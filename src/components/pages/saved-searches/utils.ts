/* eslint-disable no-param-reassign */

import type { Position } from 'geojson'

import type { ListingType } from '@configs/filters'

import { defaultMaxPrice, defaultMinPrice } from 'providers/SaveSearchProvider'
import { formatPrice, toSafeNumber } from 'utils/formatters'
import { capitalize, formatUnionKey } from 'utils/strings'

// TODO: move these helpers to SEO utils / formatters

export const getSearchLabel = (listingType: ListingType, type: string) =>
  formatUnionKey(listingType) +
  ' for ' +
  capitalize(type === 'lease' ? 'rent' : type)

export const getPriceRange = (
  minPrice: number | null | undefined,
  maxPrice: number | null | undefined
) => {
  minPrice = toSafeNumber(minPrice)
  maxPrice = toSafeNumber(maxPrice)
  const formattedMinPrice = formatPrice(minPrice)
  const formattedMaxPrice = formatPrice(maxPrice)

  const minPriceString =
    minPrice > defaultMinPrice
      ? maxPrice < defaultMaxPrice
        ? `range ${formattedMinPrice} - `
        : `${formattedMinPrice}+`
      : ''

  const maxPriceString =
    maxPrice < defaultMaxPrice
      ? minPrice > defaultMinPrice
        ? formattedMaxPrice
        : `below ${formattedMaxPrice}`
      : ''

  const priceRange =
    minPrice <= defaultMinPrice && maxPrice === defaultMaxPrice
      ? 'Any price'
      : 'Price ' + minPriceString + maxPriceString

  return priceRange
}

export const getYearBuiltRange = (
  minYear: number | undefined,
  maxYear: number | undefined
) => {
  if (!minYear && !maxYear) return ''

  const minYearString = minYear
    ? maxYear
      ? `in ${minYear}`
      : `after ${minYear}`
    : ''

  const maxYearString = maxYear
    ? minYear
      ? ` - ${maxYear}`
      : `before ${maxYear}`
    : ''

  return `Built ${minYearString}${maxYearString} year${minYear && maxYear ? 's' : ''}`
}

export const getMinBeds = (minBeds: number | undefined) =>
  minBeds ? (minBeds === -1 ? 'Studio' : `${minBeds}+ Bedrooms`) : ''

export const getPositionJson = (position: Position[], color: string) => {
  const geojson = {
    type: 'Feature',
    // NOTE: those are a limited list of SVG atributes, allowed by Mapbox, not a MUI SX
    properties: {
      fill: color,
      'fill-opacity': 0.3,
      stroke: color,
      'stroke-width': 1.5
    },
    geometry: {
      type: 'Polygon',
      coordinates: [position]
    }
  }
  return encodeURIComponent(`geojson(${JSON.stringify(geojson)})`)
}
