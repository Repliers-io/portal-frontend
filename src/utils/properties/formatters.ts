import dayjs from 'dayjs'

import propsConfig from '@configs/properties'

import { type Property, type PropertyAddress } from 'services/API'

import { capitalize, joinNonEmpty } from '../strings'
import { getCDNPath } from '../urls'

import { sanitizeScrubbed, sanitizeStreetNumber } from './sanitizers'
import { getSeoTitle, getSeoUrl } from './seo'
import { scrubbed } from '.'

export const formatShortAddress = (
  address: Partial<PropertyAddress>,
  removeScrubbed: boolean = false
) => {
  const {
    unitNumber,
    streetNumber,
    streetName,
    streetSuffix,
    streetDirection
  } = address
  const sanitizedUnit = unitNumber?.replaceAll(/(#|APT)/g, '').trim()
  const formattedUnit =
    sanitizedUnit && sanitizedUnit !== streetNumber ? `#${sanitizedUnit} -` : ''

  return joinNonEmpty(
    [
      // special case for unitNumber
      removeScrubbed && scrubbed(unitNumber) ? '' : formattedUnit,
      sanitizeStreetNumber(streetNumber || ''),
      capitalize(streetName?.toLowerCase()),
      capitalize(streetSuffix?.toLowerCase()),
      streetDirection?.toUpperCase() || ''
    ].map((value) => (removeScrubbed ? sanitizeScrubbed(value) : value)),
    ' '
  )
}

export const formatFullAddress = (
  address: Partial<PropertyAddress>,
  removeScrubbed: boolean = false
): string => {
  const { city, state, zip } = address
  return joinNonEmpty(
    [
      formatShortAddress(address, removeScrubbed),
      capitalize(city?.toLowerCase()),
      capitalize(state),
      scrubbed(zip) ? zip : String(zip || '').toUpperCase()
    ].map((value) => (removeScrubbed ? sanitizeScrubbed(value || '') : value)),
    ', '
  ).replace(/\s+/g, ' ')
}

export const formatMetadata = (property: Property, host?: string | null) => {
  const {
    details: { description },
    images
  } = property

  const openGraph = {
    images: getCDNPath(images[0], 'small'),
    url: host + getSeoUrl(property)
  }

  return {
    title: getSeoTitle(property),
    description: scrubbed(description)
      ? propsConfig.scrubbedDescriptionLabel
      : description,
    openGraph
  }
}

export const formatAreaName = (area: string) =>
  capitalize(area).replace(/\//g, ' / ').replace(/\s+/g, ' ')

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

export const formatOpenHouseTimeRange = (start: string, end: string) => {
  const startDate = dayjs(start).format('ddd, MMM D, ')

  const startTime =
    dayjs(start).format('h') +
    (dayjs(start).minute() ? `:${dayjs(start).minute()}` : '')
  const endTime =
    dayjs(end).format('h') +
    (dayjs(end).minute() ? `:${dayjs(end).minute()}` : '')

  const startTimeSuffix = dayjs(start).format('A')
  const endTimeSuffix = dayjs(end).format('A')

  return `${startDate}${
    startTime !== endTime
      ? `${startTime}${startTimeSuffix !== endTimeSuffix ? startTimeSuffix : ''}-`
      : ''
  }${endTime}${endTimeSuffix}`
}
