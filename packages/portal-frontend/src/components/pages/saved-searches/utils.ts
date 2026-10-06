/* eslint-disable no-param-reassign */

import type { Feature, MultiPolygon, Position } from 'geojson'

import type { ListingType } from '@configs/filters'
import { simplify } from '@turf/turf'

import { defaultMaxPrice, defaultMinPrice } from 'providers/SaveSearchProvider'
import { formatPrice, toSafeNumber } from 'utils/formatters'
import { capitalize, formatUnionKey } from 'utils/strings'

// TODO: move these helpers to SEO utils / formatters

export const getSearchLabel = (
  listingType: ListingType | ListingType[],
  type: string
) => {
  const label = Array.isArray(listingType)
    ? listingType.map(formatUnionKey).join(', ')
    : formatUnionKey(listingType)
  return label + ' for ' + capitalize(type === 'lease' ? 'rent' : type)
}

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

export const getMinBedrooms = (minBedrooms: number | undefined) =>
  minBedrooms
    ? minBedrooms === -1
      ? 'Studio'
      : `${minBedrooms}+ Bedrooms`
    : ''

// Mapbox Static Images API caps the whole request URL near 8192 chars. A merged
// multi-location saved-search boundary (real neighbourhood polygons, hundreds of
// points) encodes to ~20k chars and fails the image request. Keep the encoded
// overlay under this budget — leaves room for the style path, camera and token.
const maxOverlayLength = 6000

// NOTE: those are a limited list of SVG attributes allowed by Mapbox, not a MUI sx.
const overlayProperties = (color: string) => ({
  fill: color,
  'fill-opacity': 0.3,
  stroke: color,
  'stroke-width': 1.5
})

// ~1 m precision — plenty for a thumbnail and trims a lot of URL length.
const round5 = (coordinates: Position[][][]): Position[][][] =>
  coordinates.map((polygon) =>
    polygon.map((ring) =>
      ring.map(([x, y]) => [
        Math.round(x * 1e5) / 1e5,
        Math.round(y * 1e5) / 1e5
      ])
    )
  )

const encodeOverlay = (coordinates: Position[][][], color: string): string =>
  encodeURIComponent(
    `geojson(${JSON.stringify({
      type: 'Feature',
      properties: overlayProperties(color),
      geometry: { type: 'MultiPolygon', coordinates: round5(coordinates) }
    })})`
  )

// Extent rectangle of every ring — the last-resort overlay when even coarse
// simplification can't fit (e.g. a very large multi-region selection).
const boundingRect = (map: Position[][]): Position[][][] => {
  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity
  for (const ring of map) {
    for (const [x, y] of ring) {
      if (x < west) west = x
      if (x > east) east = x
      if (y < south) south = y
      if (y > north) north = y
    }
  }
  return [
    [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south]
      ]
    ]
  ]
}

// The saved-search `map` rings: every ring is its own polygon (wire union
// semantics), rendered as a MultiPolygon overlay. Simplify (Douglas–Peucker)
// with a growing tolerance until the encoded overlay fits `maxOverlayLength`,
// preserving as much shape as the URL budget allows.
export const getMapJson = (map: Position[][], color: string): string => {
  const base: Position[][][] = map.map((ring) => [ring])

  let encoded = encodeOverlay(base, color)
  if (encoded.length <= maxOverlayLength) return encoded

  const feature: Feature<MultiPolygon> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiPolygon', coordinates: base }
  }

  for (let tolerance = 0.0002; tolerance <= 0.05; tolerance *= 2) {
    const { geometry } = simplify(feature, { tolerance, highQuality: false })
    encoded = encodeOverlay(geometry.coordinates, color)
    if (encoded.length <= maxOverlayLength) return encoded
  }

  return encodeOverlay(boundingRect(map), color)
}
