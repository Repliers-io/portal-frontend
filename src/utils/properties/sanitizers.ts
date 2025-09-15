import parsePhoneNumber from 'libphonenumber-js'

import i18nConfig from '@configs/i18n'
import propsConfig from '@configs/properties'

import { type PropertyAddress } from 'services/API'

export const sanitizeScrubbed = (value: string) =>
  String(value).replaceAll(propsConfig.scrubbedDataString, '')

export const sanitizeStreetNumber = (value: string) =>
  sanitizeScrubbed(String(value)).match(/^0+$/) ? '' : value

export const sanitizeAddress = (address: PropertyAddress) => {
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
    .map((part) => part?.trim().replaceAll(propsConfig.scrubbedDataString, ''))
    .filter(Boolean)
    .join('-')
    .replace(/#/g, '')
    .replace(/[/\\'`]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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
