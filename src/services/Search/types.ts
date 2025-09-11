import type dayjs from 'dayjs'

import { type ListingStatus, type ListingType } from '@defaults/filters'

import {
  type ApiClass,
  type ApiLastStatus,
  type ApiQueryParams,
  type ApiSortBy,
  type QualitativeInsightValue
} from 'services/API'
import { type Primitive } from 'utils/formatters'

export const daysOnMarket = [
  'any',
  'lastDay',
  'lastWeek',
  'lastMonth',
  'last3Months',
  'last6Months',
  'lastYear',
  'last2Years'
] as const

export const soldWithin = [...daysOnMarket] as const

export type DaysOnMarket = (typeof daysOnMarket)[number]
export type SoldWithin = (typeof soldWithin)[number]

export interface Filters {
  listingType?: ListingType
  listingStatus?: ListingStatus

  coverImage?: string
  imageSearchItems?: any[]

  pageNum?: number
  sortBy?: ApiSortBy

  minPrice?: number
  maxPrice?: number
  minBaths?: number
  minBeds?: number
  minParkingSpaces?: number
  minGarageSpaces?: number
  propertyType?: string | string[]
  lastStatus?: ApiLastStatus | ApiLastStatus[]
  class?: ApiClass | ApiClass[]
  amenities?: string[]
  minSqft?: number
  maxSqft?: number
  maxListDate?: string
  minListDate?: string
  minSoldDate?: string
  maxSoldDate?: string
  daysOnMarket?: DaysOnMarket
  soldWithin?: SoldWithin

  minYearBuilt?: number | null
  maxYearBuilt?: number | null

  minQuality?: number
  maxQuality?: number

  overallQuality?: QualitativeInsightValue | null
  livingRoomQuality?: QualitativeInsightValue | null
  diningRoomQuality?: QualitativeInsightValue | null
  kitchenQuality?: QualitativeInsightValue | null
  bedroomQuality?: QualitativeInsightValue | null
  bathroomQuality?: QualitativeInsightValue | null
  frontOfStructureQuality?: QualitativeInsightValue | null
}

export type FilterKeys = keyof Filters

export const simpleFilters = [
  'minPrice',
  'maxPrice',
  'minBeds',
  'minBaths',
  'minGarageSpaces',
  'minParkingSpaces',
  'minYearBuilt',
  'maxYearBuilt'
] as const satisfies readonly (keyof Filters)[]

type SimpleFilter = (typeof simpleFilters)[number]

export type SimpleTransformers = {
  [key in SimpleFilter]: (value: Primitive) => Partial<Filters>
}

export type OptionalTransformers = {
  listingType: {
    [key in ListingType]: () => Partial<Filters>
  }
  listingStatus: {
    [key in ListingStatus]: () => Partial<ApiQueryParams | Filters>
  }
  daysOnMarket: {
    [key in DaysOnMarket]: (date: dayjs.Dayjs) => Partial<Filters>
  }
  soldWithin: {
    [key in SoldWithin]: (date: dayjs.Dayjs) => Partial<Filters>
  }
}
