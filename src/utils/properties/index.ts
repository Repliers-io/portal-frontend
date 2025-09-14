import dayjs from 'dayjs'

import {
  STYLE_BUSINESS,
  STYLE_COMMERCIAL,
  STYLE_CONDO,
  STYLE_LAND,
  TYPE_BUSINESS,
  TYPE_COMMERCIAL,
  TYPE_CONDO,
  TYPE_LAND
} from '@configs/filter-types'
import { aiQuality, aiQualityFeatureNames } from '@configs/filters'
import {
  premiumCondoPrice,
  premiumResidentialPrice,
  scrubbedDataString,
  scrubbedDateString
} from '@configs/properties'

import {
  type Property,
  type PropertyDetails,
  type PropertyInsightFeature
} from 'services/API'

import {
  formatEnglishNumber,
  type Primitive,
  toSafeNumber
} from '../formatters'
import { multiplySqft } from '../numbers'
import { capitalize, keyToLabel, pluralize } from '../strings'

// re-export submodules to the root level
export { createPropertyI18nUtils } from './factory'
export { sortWithFilters } from './filters'
export {
  formatAreaName,
  formatFullAddress,
  formatMetadata,
  formatMultiLineText,
  formatOpenHouseTimeRange,
  formatRawData,
  formatShortAddress
} from './formatters'
export {
  sanitizeAddress,
  sanitizeScrubbed,
  sanitizeStreetNumber
} from './sanitizers'
export { sortPropertyScoredImages } from './scores'
export {
  getSeoStatus,
  getSeoTitle,
  getSeoType,
  getSeoUrl,
  parseSeoUrl
} from './seo'

export const premium = (property: Property) => {
  const { listPrice } = property
  return (
    (property.class === 'CondoProperty' &&
      Number(listPrice) > premiumCondoPrice) ||
    (property.class === 'ResidentialProperty' &&
      Number(listPrice) > premiumResidentialPrice)
  )
}

export const active = (property: Property) => {
  const { status, lastStatus } = property
  if (
    status === 'A' ||
    ['New', 'Sc', 'Sce', 'Lc', 'Pc', 'Ext', 'Lce', 'Dft'].includes(lastStatus)
  ) {
    return true
  }
  return false
}

export const sold = (property: Property) => !active(property)

const typeStyleMatch = (
  property: Partial<Property>,
  type: string[],
  style: string[]
) => {
  const typeMatches = type.filter(
    (t) => t.toLowerCase() === property.details?.propertyType?.toLowerCase()
  ).length

  // If style array is empty, only check type
  if (!style.length) return typeMatches

  // If style array has values, check both type and style
  const styleMatches = style.filter(
    (s) => s.toLowerCase() === property.details?.style?.toLowerCase()
  ).length

  return typeMatches && styleMatches
}

export const land = (property: Property) =>
  typeStyleMatch(property, TYPE_LAND, STYLE_LAND)

export const condo = (property: Property) =>
  typeStyleMatch(property, TYPE_CONDO, STYLE_CONDO)

export const commercial = (property: Property) =>
  typeStyleMatch(property, TYPE_COMMERCIAL, STYLE_COMMERCIAL)

export const business = (property: Property) =>
  typeStyleMatch(property, TYPE_BUSINESS, STYLE_BUSINESS)

export const rent = (property: Property) => property?.type === 'Lease'

export const getIcon = (property: Property) =>
  land(property)
    ? 'land'
    : business(property)
      ? 'business'
      : commercial(property)
        ? 'commercial'
        : 'house'

export type PropertyTag = {
  label: string
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

export const getQualityFeatureLabel = (value: string) =>
  aiQualityFeatureNames[value as PropertyInsightFeature] || keyToLabel(value)

export const getQualityLabel = (quality: string) =>
  aiQuality.find((item) => item[1] === quality)?.[0] || quality

export const getQualityTag = (property: Property): PropertyTag | null => {
  const { imageInsights } = property
  const label = imageInsights
    ? getQualityLabel(imageInsights?.summary?.quality.qualitative.overall)
    : null
  return label ? { label, color: 'info' } : null
}

/**
 * @description Get the Maki symbol for the property. Maki icons are used in the static mapbox to represent the property type.
 * @url https://labs.mapbox.com/maki-icons/
 */
export const getMakiSymbol = (property: Property) =>
  land(property)
    ? 'square-stroked'
    : business(property) || commercial(property)
      ? 'city'
      : condo(property)
        ? 'building'
        : 'home'

// NOTE: there is no additional icon for condo properties,
// but we need to differentiate them from houses in the map
export const getMarkerLabel = (property: Property) =>
  capitalize(condo(property) ? 'condo' : getIcon(property))

export const publicPermission = (property: Property) =>
  property.permissions?.displayPublic === 'Y'

export const restricted = (property: Property) =>
  !publicPermission(property) || sold(property)

export const scrubbed = (value: Primitive) =>
  ['0', scrubbedDataString, scrubbedDateString].includes(String(value))

export const getStatusLabel = (property: Property) => {
  if (sold(property)) return 'Sold'
  if (restricted(property)) return 'Restricted' // Sold must also be Restricted
  if (active(property)) return 'Active'

  return 'Restricted' // This shall not happen in Real Life. Just catching improbable edge case
}

export const getSqft = (property: Property, suffix: string = 'sqft') => {
  const { details: { sqft } = {}, rooms } = property

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

export const getCardName = (mlsNumber: string, sizeMap: boolean = false) => {
  return `card-${mlsNumber}-${sizeMap.toString()}`
}

export const getUniqueKey = (property: Property) => {
  const { mlsNumber, boardId = 0, startImage = 0 } = property
  return [mlsNumber, boardId, startImage].join('-')
}

const getDays = (days: number) => {
  const daysString = pluralize(days, {
    one: '$ day',
    many: '$ days'
  })

  return {
    count: days,
    label: !Number.isFinite(days)
      ? ''
      : days === 0
        ? '🔥 Listed today'
        : `${daysString} on market`
  }
}

export const getDaysSinceListed = (property: Property) => {
  if (!property.listDate) return { count: NaN, label: '' }
  const date = dayjs(property.listDate)
  const daysNumber = dayjs().diff(date, 'day')
  return getDays(daysNumber)
}

export const getUpdatedDays = (days: string) => {
  const updatedDays = dayjs().diff(dayjs(days), 'day')
  const updatedString = pluralize(updatedDays, {
    one: '$ day',
    many: '$ days'
  })

  if (updatedDays === 0) {
    return {
      count: updatedDays,
      label: 'today'
    }
  }

  return {
    count: updatedDays,
    label: `${updatedString} ago`
  }
}

export const getLotSize = (property: Property) => {
  const { lot } = property
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

export const getBedrooms = (details: PropertyDetails) => {
  const { numBedrooms, numBedroomsPlus } = details || {}
  return getAmenities(numBedrooms, numBedroomsPlus)
}

export const getBathrooms = (details: PropertyDetails) => {
  const { numBathrooms, numBathroomsPlus } = details || {}
  return getAmenities(numBathrooms, numBathroomsPlus)
}
