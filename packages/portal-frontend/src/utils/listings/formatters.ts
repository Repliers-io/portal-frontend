import dayjs from 'dayjs'

import filtersConfig from '@configs/filters'
import i18nConfig from '@configs/i18n'
import listingsConfig from '@configs/listings'
import locationConfig from '@configs/location'

import { type ApiListing, type ApiListingAddress } from 'services/API'

import { capitalize, joinNonEmpty } from '../strings'
import { getCDNPath } from '../urls'

import { sanitizeScrubbed, sanitizeStreetNumber } from './sanitizers'
import { getSeoTitle, getSeoUrl } from './seo'
import { scrubbed } from '.'

// Normalized address pieces shared by the address formatters below.
const getAddressParts = (
  address: Partial<ApiListingAddress>,
  removeScrubbed: boolean
) => {
  const {
    unitNumber,
    streetNumber,
    streetName,
    streetSuffix,
    streetDirection,
    streetDirectionPrefix
  } = address

  const sanitizedUnit = unitNumber?.replaceAll(/(#|APT)/g, '').trim()
  const showUnit =
    !!sanitizedUnit &&
    sanitizedUnit !== streetNumber &&
    !(removeScrubbed && scrubbed(unitNumber))

  return {
    unitBare: showUnit && sanitizedUnit ? sanitizedUnit : '',
    number: sanitizeStreetNumber(streetNumber || ''),
    name: capitalize(streetName?.toLowerCase()),
    suffix: capitalize(streetSuffix?.toLowerCase()),
    // RESO StreetDirPrefix / StreetDirSuffix: "2821 NE Center Street", "3516 224th Avenue NE"
    prefix: (streetDirectionPrefix || '').toUpperCase(),
    direction: (streetDirection || '').toUpperCase()
  }
}

export const formatShortAddress = (
  address: Partial<ApiListingAddress>,
  removeScrubbed: boolean = false
) => {
  // US format: directionals around the street, unit after it ("1310 E Union St #202")
  // default: unit before the street, one directional after ("#202 - 1310 Union St E")
  const us = listingsConfig.addressFormat === 'us'

  const { unitBare, number, prefix, name, suffix, direction } = getAddressParts(
    address,
    removeScrubbed
  )
  const unit = unitBare ? `#${unitBare}` : ''

  return joinNonEmpty(
    (us
      ? [number, prefix, name, suffix, direction, unit]
      : [unit && `${unit} -`, number, name, suffix, prefix || direction]
    ).map((value) => (removeScrubbed ? sanitizeScrubbed(value) : value)),
    ' '
  )
}

// Compact SEO-title order: "3816 B Evanston Avenue N" — bare unit after the number,
// directionals around the street. Independent of the tenant `addressFormat`.
export const formatTitleAddress = (
  address: Partial<ApiListingAddress>,
  removeScrubbed: boolean = true
) => {
  const { unitBare, number, prefix, name, suffix, direction } = getAddressParts(
    address,
    removeScrubbed
  )

  return joinNonEmpty(
    [number, unitBare, prefix, name, suffix, direction].map((value) =>
      removeScrubbed ? sanitizeScrubbed(value) : value
    ),
    ' '
  )
}

export const formatFullAddress = (
  address: Partial<ApiListingAddress>,
  removeScrubbed: boolean = false
): string => {
  const { neighborhood, city, state, zip } = address
  return joinNonEmpty(
    [
      formatShortAddress(address, removeScrubbed),
      capitalize(neighborhood?.toLowerCase()),
      capitalize(city?.toLowerCase()),
      capitalize(state),
      scrubbed(zip) ? zip : String(zip || '').toUpperCase()
    ].map((value) => (removeScrubbed ? sanitizeScrubbed(value || '') : value)),
    ', '
  ).replace(/\s+/g, ' ')
}

// The city a listing is shown under: a board that files the whole region as one city
// (REBNY's "New York City") gives the tree city its area stands for (`areaCities`).
export const listingCity = ({ area, city }: Partial<ApiListingAddress>) =>
  locationConfig.areaCities[area ?? ''] ?? city

// The closing date shown as "sold date" lives in a different field per MLS feed;
// the tenant `soldDateSource` config picks which one to read.
export const soldDate = (listing: ApiListing): string | null =>
  filtersConfig.soldDateSource === 'closedDate'
    ? listing.timestamps.closedDate
    : listing.soldDate

// Sort token for newest sale first — must match the displayed field (`soldDate`),
// else cards show the closing date but sort by another.
export const soldDateDesc =
  filtersConfig.soldDateSource === 'closedDate'
    ? 'closedDateDesc'
    : 'soldDateDesc'

// Date-range filter keys for a "sold" window — must match the field `soldDate`
// reads, else the window clips on one date while the API groups buckets on another.
export const soldDateRange = (min: string, max: string) =>
  filtersConfig.soldDateSource === 'closedDate'
    ? { minClosedDate: min, maxClosedDate: max }
    : { minSoldDate: min, maxSoldDate: max }

export const formatMetadata = (listing: ApiListing, host?: string | null) => {
  const {
    details: { description },
    images = [],
    timestamps
  } = listing

  const openGraph = {
    type: 'website' as const,
    images: getCDNPath(images[0], 'small', timestamps?.photosUpdated),
    url: host + getSeoUrl(listing)
  }

  return {
    title: getSeoTitle(listing),
    description: scrubbed(description)
      ? listingsConfig.scrubbed.descriptionLabel
      : description,
    alternates: { canonical: getSeoUrl(listing) },
    openGraph,
    twitter: {
      card: 'summary_large_image' as const,
      title: getSeoTitle(listing),
      description: scrubbed(description)
        ? listingsConfig.scrubbed.descriptionLabel
        : description,
      images: [getCDNPath(images[0], 'small', timestamps?.photosUpdated)]
    }
  }
}

export const formatAreaName = (area: string) =>
  capitalize(area).replace(/\//g, ' / ').replace(/\s+/g, ' ')

export const formatPropertyClassLabel = (
  propertyClass?: string,
  options?: { allLabel?: string }
): string => {
  if (!propertyClass) return ''
  if (propertyClass === 'all') return options?.allLabel ?? ''
  return capitalize(propertyClass)
}

export const formatMultiLineText = (text: string) => {
  const trimmedText = text.replace('<-more->', ' ').replace(/\r/g, '').trim()
  const paragraphDivider = trimmedText.includes('\n\n') ? '\n\n' : '\n'
  return trimmedText
    .split(paragraphDivider)
    .map((p) => `<p style="margin: 16px 0">${p}</p>`)
    .join('')
    .replace(/\s+/g, ' ')
}

export const formatRawData = (raw: string | undefined) => {
  return !raw || !raw.trim()
    ? ''
    : String(raw)
        .trim()
        .replace(/\r/g, '')
        .replace(/\n\n/g, '<br />')
        .replace(/,/g, ', ')
        .replace(/\//g, ' / ')
        .replace(/\s+/g, ' ')
}

export const formatTimeSlot = (startTime: string, endTime: string) => {
  const to12 = (h: number) => h % 12 || 12
  const suffix = (h: number) => (h >= 12 ? 'PM' : 'AM')
  const fmt = (h: number, m: number) =>
    `${to12(h)}${m ? `:${String(m).padStart(2, '0')}` : ''}`

  const parseTime = (t: string): [number, number] => {
    if (t.includes('T')) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: i18nConfig.timeZone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).formatToParts(new Date(t))
      const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0')
      const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0')
      return [h, m]
    }
    const [time, suf] = t.trim().split(' ')
    const [h, m = '0'] = time.split(':')
    const hour =
      parseInt(h) +
      (suf === 'PM' && parseInt(h) !== 12 ? 12 : 0) -
      (suf === 'AM' && parseInt(h) === 12 ? 12 : 0)
    return [hour, parseInt(m)]
  }

  const [sh, sm] = parseTime(startTime)
  const [eh, em] = parseTime(endTime)
  const s = fmt(sh, sm)
  const e = fmt(eh, em)
  const ss = suffix(sh)
  const es = suffix(eh)
  return `${s !== e || ss !== es ? `${s}${ss !== es ? ss : ''}-` : ''}${e}${es}`
}

export const formatOpenHouseBadge = (oh: {
  date: string
  startTime: string
  endTime: string
}) => {
  const day = dayjs(oh.date).isSame(dayjs(), 'day')
    ? 'Today'
    : dayjs(oh.date).format('ddd')
  return `${day} ${formatTimeSlot(oh.startTime, oh.endTime)}`
}

export const formatOpenHouseTimeRange = (oh: {
  date: string
  startTime: string
  endTime: string
}) =>
  `${dayjs(oh.date).format('ddd, MMM D, ')}${formatTimeSlot(oh.startTime, oh.endTime)}`
