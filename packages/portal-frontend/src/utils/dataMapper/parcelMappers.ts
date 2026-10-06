import {
  formatDate,
  formatEnglishNumber,
  formatEnglishPrice
} from 'utils/formatters'
import { titleCase } from 'utils/strings'

import { isEmptyValue } from './utils'

/**
 * The county assessor's record as it reaches the client: every column a string, and
 * only the filled ones — `/api/public-record` drops the empty columns, which are the
 * majority on most parcels.
 */
export type ParcelRecord = Record<string, string>

// The record answers with '0' where it has nothing (a tax roll with no amount, a
// parcel with no garage), and `isEmptyValue` already treats that as empty.
const filled = (raw: unknown): string | null =>
  isEmptyValue(raw as string) ? null : String(raw)

export const mapperParcelPrice = (_: ParcelRecord, raw?: unknown) => {
  const amount = filled(raw)
  return amount ? formatEnglishPrice(Number(amount), 0) : null
}

export const mapperParcelArea = (_: ParcelRecord, raw?: unknown) => {
  const sqft = filled(raw)
  return sqft ? `${formatEnglishNumber(sqft, 0)} sqft` : null
}

export const mapperParcelAcres = (_: ParcelRecord, raw?: unknown) => {
  const acres = filled(raw)
  return acres ? `${acres} acres` : null
}

/**
 * The assessor writes dates as `YYYYMMDD` with no separators, which `Date` reads as a
 * millisecond timestamp — split it into an ISO date before formatting.
 */
export const mapperParcelDate = (_: ParcelRecord, raw?: unknown) => {
  const digits = filled(raw)
  if (!digits || !/^\d{8}$/.test(digits)) return null
  return formatDate(
    `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
  )
}

/** Assessor text arrives fully capitalised ("INDEPENDENT CONDOMINIUMS"). */
export const mapperParcelText = (_: ParcelRecord, raw?: unknown) => {
  const text = filled(raw)
  return text ? titleCase(text) : null
}
