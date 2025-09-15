import dayjs from 'dayjs'
import parsePhoneNumber, { AsYouType } from 'libphonenumber-js'

import i18nConfig from '@configs/i18n'
import propsConfig from '@configs/properties'

import { parseFootInch } from './numbers'
import { scrubbed } from './properties'

export type Primitive = string | number | boolean | bigint | null | undefined

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
  if (scrubbed(date as Primitive)) return propsConfig.scrubbedDataString
  if (!parsedDate.isValid()) return null

  return utc ? parsedDate.utc().format(template) : parsedDate.format(template)
}

export const toSafeNumber = (value: Primitive) => {
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'string') return parseFloat(value.replace(',', '')) || 0
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

export const formatImperialDistance = (value: string | number) => {
  const numberType = typeof value === 'number'
  const inches = (numberType ? value : parseFootInch(value)) || 0
  if (!inches && !numberType) return value

  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12

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
