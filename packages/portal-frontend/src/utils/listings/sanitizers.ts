import parsePhoneNumber from 'libphonenumber-js'

import i18nConfig from '@configs/i18n'
import listingsConfig from '@configs/listings'

import { type ApiListingAddress } from 'services/API'

const { scrubbed } = listingsConfig

export const sanitizeScrubbed = (value: string) =>
  String(value || '').replaceAll(scrubbed.data, '')

export const sanitizeStreetNumber = (value: string) =>
  sanitizeScrubbed(value).match(/^0+$/) ? '' : value

export const sanitizeAddress = (address: Partial<ApiListingAddress>) => {
  const {
    unitNumber = '',
    streetNumber = '',
    streetName = '',
    streetSuffix = '',
    streetDirection = '',
    city = '',
    zip = ''
  } = address

  const parts = [
    unitNumber,
    streetNumber,
    streetName,
    streetSuffix,
    streetDirection,
    city,
    zip
  ]

  return parts
    .map((part) => part?.trim().replaceAll(scrubbed.data, ''))
    .filter(Boolean)
    .join(' ')
    .replace(/#/g, '')
    .replace(/[./\\'`]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

export const sanitizePhoneNumber = (value: string | null | undefined) => {
  if (!value) return ''
  const phoneNumber = parsePhoneNumber(value, i18nConfig.phoneNumberLocale)
  return (phoneNumber?.number || '').replace('+', '')
}

export const sanitizeEmail = (value: string | null | undefined) => {
  if (!value) return ''
  return String(value).trim().toLowerCase()
}
