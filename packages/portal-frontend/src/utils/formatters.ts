import dayjs from 'dayjs'
import parsePhoneNumber, { AsYouType } from 'libphonenumber-js'

import i18nConfig from '@configs/i18n'
import listingsConfig from '@configs/listings'

import relativeTime from 'dayjs/plugin/relativeTime'

import { type MapPoint } from 'services/Search'

import { parseFootInch } from './numbers'
import { pluralize } from './strings'

dayjs.extend(relativeTime)

export type Primitive = string | number | boolean | bigint | null | undefined

// Scrubbed (redacted) MLS sentinels. Defined here, not imported from the listings
// barrel, to avoid a circular import that drags @configs/map (-> MUI/emotion) into
// every server consumer of formatters.
// The backend scrubs both text and numeric fields to the string sentinel, so a
// genuine 0 (a studio's bedrooms, a "No" boolean) is no longer mistaken for
// scrubbed data.
export const scrubbed = (value: Primitive) =>
  [listingsConfig.scrubbed.data, listingsConfig.scrubbed.date].includes(
    String(value)
  )

export const formatPhoneNumber = (value: string | null | undefined) => {
  const phoneNumber = value
    ? parsePhoneNumber(value, i18nConfig.phoneNumberLocale)
    : ''
  if (!phoneNumber) return ''

  return phoneNumber.formatNational()
}

export const formatPhoneNumberAsYouType = (
  newVal: string,
  currentVal: string | null = ''
) => {
  // backspace handling
  if (newVal.length < (currentVal || '').length) return newVal
  // library formating
  return new AsYouType(i18nConfig.phoneNumberLocale).input(newVal)
}

type FormatDateOptions = {
  template?: string
  utc?: boolean
}

export const formatDate = (
  date: string | number | Date | null | undefined,
  options: FormatDateOptions = {
    template: i18nConfig.dateFormatShort,
    utc: false
  }
): string | null => {
  if (!date) return null

  const { template = i18nConfig.dateFormatShort, utc = false } = options
  const parsedDate = dayjs(date)

  // TODO: not sure if we need to check for scrubbed here
  if (scrubbed(date as Primitive)) return listingsConfig.scrubbed.data
  if (!parsedDate.isValid()) return null

  return utc ? parsedDate.utc().format(template) : parsedDate.format(template)
}

export const formatRelativeTime = (
  date: string | number | Date | null | undefined
): string | null => {
  if (!date) return null

  if (scrubbed(date as Primitive)) return listingsConfig.scrubbed.data

  const parsedDate = dayjs(date)
  if (!parsedDate.isValid()) return null

  return parsedDate.fromNow()
}

export const toSafeNumber = (value: Primitive) => {
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'string') return parseFloat(value.replace(/,/g, '')) || 0
  if (
    typeof value !== 'number' ||
    Number.isNaN(value) ||
    !Number.isFinite(value)
  )
    return 0
  return value
}

export const toSafeString = (value: Primitive) => {
  return toSafeNumber(value).toString()
}

export const formatPercentage = (value: Primitive) => {
  const number = toSafeNumber(value)
  const sign = number > 0 ? '+' : ''
  return `${sign}${number}%`
}

export const formatLongNumber = (
  value: Primitive,
  fractions = i18nConfig.fractionDigits
) => {
  const suffixes = ['', 'K', 'M', 'B', 'T']

  let precision
  let number = toSafeNumber(value)
  let rounded = number // initial value
  while (rounded >= 1e3 && suffixes.length > 1) {
    number /= 1e3
    precision = number >= 10 ? 1 : 10 ** fractions
    rounded = Math.round(number * precision) / precision
    suffixes.shift()
  }
  return `${rounded}${suffixes[0]}`
}

export const formatPrice = (value: Primitive, currency = '$') => {
  const number = toSafeNumber(value)
  return `${number < 0 ? '-' : ''}${currency}${formatLongNumber(number)}`
}

/**
 * This is the historical name of the "commas price" representation,
 * in opposite to the French (European) one, which uses spaces as separators.
 */
export const formatEnglishNumber = (
  value: Primitive,
  maximumFractionDigits = i18nConfig.fractionDigits
) => {
  return new Intl.NumberFormat(i18nConfig.numberFormat, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(toSafeNumber(value))
}

export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP'

export const formatEnglishPrice = (
  value: Primitive,
  maximumFractionDigits = i18nConfig.fractionDigits,
  currency: Currency = i18nConfig.currency
) => {
  return new Intl.NumberFormat(i18nConfig.numberFormat, {
    currency,
    style: 'currency',
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(toSafeNumber(value))
}

export const formatShortPrice = (value: number): string => {
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`
  }
  if (value >= 1_000) {
    const k = value / 1_000
    return `$${k % 1 === 0 ? k : k < 10 ? k.toFixed(1) : Math.round(k)}K`
  }
  return `$${value}`
}

const inchesPerMeter = 39.3701

export const formatImperialDistance = (
  value: string | number,
  unit: 'symbols' | 'words' = 'symbols'
) => {
  const numberType = typeof value === 'number'
  let inches = (numberType ? value : parseFootInch(value)) || 0

  if (!inches && !numberType) {
    // a bare string that didn't parse as foot-inch: a metric metre value or junk
    const metres = Number(value)
    const numericMetres = value !== '' && Number.isFinite(metres)

    // words mode renders imperial: convert metres → inches
    if (unit === 'words' && numericMetres) inches = metres * inchesPerMeter
    // otherwise keep prior behaviour: round metric decimals, pass the rest through
    else
      return String(value).includes('.')
        ? String(Math.round(metres * 100) / 100)
        : value
  }

  const rounded = Math.round(inches)
  const feet = Math.floor(rounded / 12)
  const remainingInches = rounded % 12

  if (unit === 'words') return `${feet} ft ${remainingInches} in`

  // here lies Balin, son of Fundin, lord of Moria
  // eslint-disable-next-line no-irregular-whitespace
  return `${feet}′ ${remainingInches}″`
}

export const toAffirmative = (value: Primitive | object) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'y' ? 'Yes' : 'No'
  }
  return value ? 'Yes' : 'No'
}

/**
 * Formats radius value in kilometers or meters
 */
export const formatRadiusMetric = (radiusKm: number): string => {
  if (radiusKm >= 0.95) {
    return Number(radiusKm.toFixed(radiusKm >= 5 ? 0 : 1)) + ' km'
  } else {
    return Math.round(radiusKm * 10) * 100 + ' meters'
  }
}

/**
 * Formats radius value in miles
 */
export const formatRadiusImperial = (radiusKm: number): string => {
  const radiusMiles = radiusKm * 0.621371
  return pluralize(Number(radiusMiles.toFixed(radiusMiles >= 5 ? 0 : 1)), {
    one: '$ mile',
    many: '$ miles'
  })
}

/**
 * Formats radius value in kilometers/meters or miles
 * Uses i18nConfig.measurementSystem to determine the unit
 */
export const formatRadius = (radiusKm: number): string => {
  if (i18nConfig.measurementSystem === 'metric') {
    return formatRadiusMetric(radiusKm)
  } else {
    return formatRadiusImperial(radiusKm)
  }
}

export const formatPointString = (point: MapPoint): string => {
  const [lat, lng] = point.center
  const coords = `[${lat.toFixed(4)}°, ${lng.toFixed(4)}°]`
  return point.radius != null
    ? `${coords} ${formatRadius(point.radius)} area`
    : coords
}
