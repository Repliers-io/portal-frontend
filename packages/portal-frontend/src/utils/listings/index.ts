import { type ReactElement } from 'react'
import dayjs from 'dayjs'

import { type ListingCardSize } from '@configs/cards-grids'
import filtersConfig from '@configs/filters'
import listingsConfig from '@configs/listings'
import mapConfig from '@configs/map'
import { type CSSObject } from '@emotion/react'
import { type MarkerSize } from '@shared/Map'

import {
  type ApiListing,
  type ApiListingDetails,
  type PropertyInsightFeature,
  type QualitativeInsightValue
} from 'services/API'

import { propertyTypesOf, stylesOf } from '../filters'
import { formatEnglishNumber, scrubbed, toSafeNumber } from '../formatters'
import { multiplySqft } from '../numbers'
import { capitalize, keyToLabel } from '../strings'

// re-export submodules to the root level
export {
  type BadgeGroup,
  type BadgeSurfaces,
  offMarketLabel,
  resolveBadge,
  resolveBadgeLabel
} from './badge'
export { createListingI18nUtils } from './factory'
export { sortWithFilters } from './filters'
export {
  formatAreaName,
  formatFullAddress,
  formatMetadata,
  formatMultiLineText,
  formatOpenHouseBadge,
  formatOpenHouseTimeRange,
  formatRawData,
  formatShortAddress,
  formatTimeSlot,
  listingCity,
  soldDate,
  soldDateDesc,
  soldDateRange
} from './formatters'
export { resolveGalleryImages } from './gallery'
export {
  type ListingMarkerColor,
  multiUnitKey,
  resolveListingMarkerColor
} from './markers'
export {
  sanitizeAddress,
  sanitizeScrubbed,
  sanitizeStreetNumber
} from './sanitizers'
export { markMatchedImage } from './scores'
export {
  getSeoStatus,
  getSeoTitle,
  getSeoType,
  getSeoUrl,
  parseSeoUrl,
  resolveBoardId
} from './seo'
export {
  active,
  daysOnMarketCount,
  getStatusLabel,
  inactive,
  lastStatusLabel,
  pending,
  rent,
  resolveStatusGroup,
  sold,
  soldOrRented
} from './status'
export {
  classifyTourUrl,
  getListingTours,
  type TourMedia,
  type TourMediaType
} from './tours'
export { displayPublic, restricted, restrictedToGuest } from './visibility'

const {
  pricing: { premiumCondo, premiumResidential }
} = listingsConfig

const { aiQuality, aiQualityFeatureNames } = filtersConfig

export const premium = (listing: ApiListing) => {
  const { listPrice } = listing
  return (
    (listing.class === 'CondoProperty' && Number(listPrice) > premiumCondo) ||
    (listing.class === 'ResidentialProperty' &&
      Number(listPrice) > premiumResidential)
  )
}

// WARN: some portal instances like (URBN/NWMLS) require fetching several
// `raw` fields even for basic cards display, because they include important
// fields to calculate cummulateve days on market (NWMLS-CDOM), so
// we no longer able to rely on the presence of `raw` to determine if
// details are available. Counting raw fields is a dangerous heuristic,
// but there is no better alternative for now.
export const detailsAvailable = (listing: ApiListing) =>
  Object.keys(listing.raw || {}).length > 5 || Boolean(listing.rooms)

const typeStyleMatch = (
  listing: Partial<ApiListing>,
  type: string[],
  style: string[]
) => {
  const typeMatches = type.some(
    (t) => t.toLowerCase() === listing.details?.propertyType?.toLowerCase()
  )

  // If style array is empty, only check type
  if (!style.length) return typeMatches

  // If style array has values, check both type and style
  const styleMatches = style.some(
    (s) => s.toLowerCase() === listing.details?.style?.toLowerCase()
  )

  return typeMatches && styleMatches
}

export const land = (listing: ApiListing) =>
  typeStyleMatch(listing, propertyTypesOf('land'), stylesOf('land'))

// `class` is a scrub-safe fallback: restricted listings redact
// `details.propertyType` to the scrub placeholder, so type/style matching can't
// classify them — but `class` stays intact under scrubbing.
export const condo = (listing: ApiListing) =>
  typeStyleMatch(listing, propertyTypesOf('condo'), stylesOf('condo')) ||
  listing.class === 'CondoProperty'

export const commercial = (listing: ApiListing) =>
  typeStyleMatch(
    listing,
    propertyTypesOf('commercial'),
    stylesOf('commercial')
  ) || listing.class === 'CommercialProperty'

export const business = (listing: ApiListing) =>
  typeStyleMatch(listing, propertyTypesOf('business'), stylesOf('business'))

export const getIcon = (listing: ApiListing) =>
  land(listing)
    ? 'land'
    : business(listing)
      ? 'business'
      : commercial(listing)
        ? 'commercial'
        : 'house'

export type ListingTag = {
  label: string
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  icon?: ReactElement
  quality?: QualitativeInsightValue
}

export const getQualityFeatureLabel = (value: string) =>
  aiQualityFeatureNames[value as PropertyInsightFeature] || keyToLabel(value)

export const getQualityLabel = (quality: string) =>
  aiQuality.find((item) => item[1] === quality)?.[0] || quality

export const getQualityTag = (listing: ApiListing): ListingTag | null => {
  const { imageInsights } = listing
  const quality = imageInsights?.summary?.quality.qualitative.overall
  const label = quality ? getQualityLabel(quality) : null
  return label ? { label, color: 'info', quality } : null
}

export const upcomingOpenHouses = (listing: ApiListing) => {
  const entries = Object.values(listing.openHouse || {})
  const today = dayjs().startOf('day')
  return entries
    .filter(
      (oh) =>
        oh.date &&
        ![
          '0',
          listingsConfig.scrubbed.data,
          listingsConfig.scrubbed.date
        ].includes(oh.date) &&
        !dayjs(oh.date).isBefore(today)
    )
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
}

/**
 * @description Get the Maki symbol for the listing. Maki icons are used in the static mapbox to represent the property type.
 * @url https://labs.mapbox.com/maki-icons/
 */
export const getMakiSymbol = (listing: ApiListing) =>
  land(listing)
    ? 'square-stroked'
    : business(listing) || commercial(listing)
      ? 'city'
      : condo(listing)
        ? 'building'
        : 'home'

export const getListingNeighborhood = (
  listing: Pick<ApiListing, 'locations'>
) => listing.locations?.find((loc) => loc.type === 'neighborhood')

// NOTE: there is no additional icon for condo properties,
// but we need to differentiate them from houses in the map
export const getMarkerLabel = (listing: ApiListing) =>
  capitalize(condo(listing) ? 'condo' : getIcon(listing))

// scrubbed lives in ../formatters (cycle-break); re-exported here for back-compat
export { scrubbed }

export const stripScrubbedImages = ({
  images,
  imageInsights,
  ...rest
}: ApiListing): ApiListing => ({
  ...rest,
  images: images?.filter((img) => !scrubbed(img)) ?? [],
  imageInsights: imageInsights && {
    ...imageInsights,
    images: imageInsights.images.filter(({ image }) => !scrubbed(image))
  }
})

export const displayOnMap = (listing: ApiListing) => {
  const { map, permissions } = listing

  if (permissions?.displayOnMap === 'N' || !map?.longitude || !map?.latitude) {
    return false
  }

  return true
}

export const getSqft = (listing: ApiListing, suffix: string = 'sqft') => {
  const { details: { sqft } = {}, rooms } = listing

  if (sqft) {
    const number = Math.floor(parseInt(sqft, 10)) // trim ['’] if present in the string
    return {
      number,
      label: `${formatEnglishNumber(number)} ${suffix}`
    }
  }

  const roomsArray = Object.values(rooms || {})
  const sqInches = roomsArray.reduce(
    (acc, room) => acc + multiplySqft(room.length, room.width).inches,
    0
  )
  const number = Math.floor(sqInches / 144)

  return {
    number,
    label: `${formatEnglishNumber(number)} ${suffix}`
  }
}

export const getImageName = (path: string) => {
  const start = path.lastIndexOf('/') + 1
  const extStart = path.lastIndexOf('.')
  const end = -1 < extStart ? extStart : path.length

  const fileName = path.substring(start, end)
  const prefixStart = fileName.lastIndexOf('IMG-')
  const imgName =
    -1 < prefixStart ? fileName.substring(prefixStart + 4) : fileName

  return imgName
}

// a card size is a number of pixels or a CSS length such as '100%'
export const cssLength = (value: CSSObject['width'] | CSSObject['height']) =>
  typeof value === 'number' ? `${value}px` : String(value)

export const getCardName = (
  mlsNumber: string,
  size: ListingCardSize = 'medium'
) => {
  return `card-${mlsNumber}-${size}`
}

/**
 * Highlight a listing's side-grid card(s). A multi-unit marker or a parcel holding
 * several listings carries every mlsNumber, so the whole group lights up together.
 * The grid renders at 'medium' size → id `card-${mls}-medium`; the hover popup
 * renders at 'small', a different id, so both can sit in the DOM without clashing.
 */
export const cardsActive = (mlsNumbers: string[], active: boolean): void => {
  mlsNumbers.forEach((mlsNumber) =>
    document
      .getElementById(getCardName(mlsNumber))
      ?.classList.toggle('active', active)
  )
}

/**
 * Lights the marker standing in for each listing. A member of a multi-unit marker
 * has no element id of its own, so resolve through `data-members`.
 */
export const markersActive = (mlsNumbers: string[], active: boolean): void => {
  mlsNumbers.forEach((mlsNumber) =>
    document
      .querySelector(`.lm[data-members~="${mlsNumber}"]`)
      ?.classList.toggle('active', active)
  )
}

export const getMarkerName = (mlsNumber: string) => `marker-${mlsNumber}`

export const getMarkerSize = (zoom: number): MarkerSize =>
  zoom < mapConfig.zoom.markerPoint ? 'point' : 'tag'

export const getUniqueKey = (listing: ApiListing) => {
  const { mlsNumber, boardId = 0, matchedImage = '' } = listing
  return [mlsNumber, boardId, getImageName(matchedImage)].join('-')
}

/**
 * Drop listings that repeat the same identity (mlsNumber + boardId), keeping the
 * first. The same MLS can arrive as a top-level result that is also inlined into
 * a small cluster. Without this the duplicate renders a second card/marker and
 * trips React's duplicate-key warning.
 */
export const dedupeListings = (listings: ApiListing[]): ApiListing[] => {
  const seen = new Set<string>()
  return listings.filter(({ mlsNumber, boardId }) => {
    const key = `${mlsNumber}-${boardId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const getLotSize = (listing: ApiListing) => {
  const { lot } = listing
  const number = toSafeNumber(lot?.acres)

  return {
    number,
    label: `${number.toFixed(2) /* .replaceAll('.', ',') */} acres`
  }
}

const getAmenities = (main: string, plus: string) => {
  const mainNumber = toSafeNumber(main)
  const plusNumber = toSafeNumber(plus)

  return {
    count: mainNumber + plusNumber,
    label: [mainNumber, plusNumber].filter(Boolean).join('+')
  }
}

export const getBedrooms = (details: ApiListingDetails) => {
  const { numBedrooms, numBedroomsPlus } = details || {}
  return getAmenities(numBedrooms, numBedroomsPlus)
}

export const getBathrooms = (details: ApiListingDetails) => {
  const { numBathrooms, numBathroomsPlus } = details || {}
  return getAmenities(numBathrooms, numBathroomsPlus)
}
