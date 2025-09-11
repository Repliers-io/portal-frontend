import {
  CLASS_COMMERCIAL,
  CLASS_CONDO,
  CLASS_RESIDENTIAL,
  LAST_STATUS_NEW,
  LAST_STATUS_SC,
  LAST_STATUS_SOLD,
  STATUS_AVAILABLE,
  STATUS_UNAVAILABLE
} from '@configs/filter-constants'
import {
  STYLE_BUSINESS,
  STYLE_COMMERCIAL,
  STYLE_CONDO,
  STYLE_LAND,
  STYLE_MULTI_FAMILY,
  STYLE_RESIDENTIAL,
  STYLE_SEMIDETACHED,
  STYLE_TOWNHOME,
  TYPE_BUSINESS,
  TYPE_COMMERCIAL,
  TYPE_CONDO,
  TYPE_LAND,
  TYPE_MULTI_FAMILY,
  TYPE_RENTAL,
  TYPE_RESIDENTIAL,
  TYPE_SEMIDETACHED,
  TYPE_TOWNHOME
} from '@configs/filter-types'

import type { OptionalTransformers, SimpleTransformers } from './types'
import { formatPastDate, nonZeroValue } from './utils'

export const simpleTransformers: SimpleTransformers = {
  minPrice: (v) => {
    const num = Number(v)
    return num == 0 ? { minPrice: 1 } : { minPrice: num } // should always be at least 1
  },
  maxPrice: (v) => nonZeroValue('maxPrice', v),
  minBeds: (v) => {
    const effect = nonZeroValue('minBeds', v)
    return effect.minBeds == -1 ? { minBeds: 1 } : effect // process -1 as Studio (1 Bed)
  },
  minBaths: (v) => nonZeroValue('minBaths', v),
  minGarageSpaces: (v) => nonZeroValue('minGarageSpaces', v),
  minParkingSpaces: (v) => nonZeroValue('minParkingSpaces', v),
  minYearBuilt: (v) => nonZeroValue('minYearBuilt', v),
  maxYearBuilt: (v) => nonZeroValue('maxYearBuilt', v)
}

export const optionalTransformers: OptionalTransformers = {
  listingType: {
    residential: () => ({
      class: CLASS_RESIDENTIAL,
      propertyType: TYPE_RESIDENTIAL,
      style: STYLE_RESIDENTIAL
    }),
    condo: () => ({
      class: CLASS_CONDO,
      propertyType: TYPE_CONDO,
      style: STYLE_CONDO
    }),
    multiFamily: () => ({
      propertyType: TYPE_MULTI_FAMILY,
      style: STYLE_MULTI_FAMILY
    }),
    townhome: () => ({
      propertyType: TYPE_TOWNHOME,
      style: STYLE_TOWNHOME
    }),
    semiDetached: () => ({
      propertyType: TYPE_SEMIDETACHED,
      style: STYLE_SEMIDETACHED
    }),
    land: () => ({
      // WARN: pretty controversial class definition for land listings
      class: [CLASS_RESIDENTIAL, CLASS_CONDO, CLASS_COMMERCIAL],
      propertyType: TYPE_LAND,
      style: STYLE_LAND
    }),
    business: () => ({
      propertyType: TYPE_BUSINESS,
      style: STYLE_BUSINESS
    }),
    commercial: () => ({
      // WTF: why did we disable it?
      // class: CLASS_COMMERCIAL,
      propertyType: TYPE_COMMERCIAL,
      style: STYLE_COMMERCIAL
    }),
    allListings: () => ({
      class: [CLASS_RESIDENTIAL, CLASS_CONDO],
      propertyType: [
        TYPE_RESIDENTIAL,
        TYPE_CONDO,
        TYPE_MULTI_FAMILY,
        TYPE_LAND,
        TYPE_BUSINESS,
        TYPE_COMMERCIAL
      ].flat()
    })
  },
  listingStatus: {
    rent: () => ({
      type: 'lease',
      status: STATUS_AVAILABLE,
      propertyType: TYPE_RENTAL,
      lastStatus: [LAST_STATUS_NEW, LAST_STATUS_SC]
    }),
    sold: () => ({
      type: 'sale',
      status: STATUS_UNAVAILABLE,
      lastStatus: LAST_STATUS_SOLD
    }),
    active: () => ({
      type: 'sale',
      status: STATUS_AVAILABLE,
      lastStatus: [LAST_STATUS_NEW, LAST_STATUS_SC]
    }),
    all: () => ({
      type: 'sale',
      status: [STATUS_AVAILABLE, STATUS_UNAVAILABLE]
    })
  },

  daysOnMarket: {
    lastDay: (date) => ({ minListDate: formatPastDate(date, 1, 'day') }),
    lastWeek: (date) => ({ minListDate: formatPastDate(date, 1, 'week') }),
    lastMonth: (date) => ({ minListDate: formatPastDate(date, 1, 'month') }),
    last3Months: (date) => ({ minListDate: formatPastDate(date, 3, 'month') }),
    last6Months: (date) => ({ minListDate: formatPastDate(date, 6, 'month') }),
    lastYear: (date) => ({ minListDate: formatPastDate(date, 1, 'year') }),
    last2Years: (date) => ({ minListDate: formatPastDate(date, 2, 'year') }),
    any: () => ({})
  },
  soldWithin: {
    lastDay: (date) => ({ minSoldDate: formatPastDate(date, 1, 'day') }),
    lastWeek: (date) => ({ minSoldDate: formatPastDate(date, 1, 'week') }),
    lastMonth: (date) => ({ minSoldDate: formatPastDate(date, 1, 'month') }),
    last3Months: (date) => ({ minSoldDate: formatPastDate(date, 3, 'month') }),
    last6Months: (date) => ({ minSoldDate: formatPastDate(date, 6, 'month') }),
    lastYear: (date) => ({ minSoldDate: formatPastDate(date, 1, 'year') }),
    last2Years: (date) => ({ minSoldDate: formatPastDate(date, 2, 'year') }),
    any: () => ({})
  }
}
