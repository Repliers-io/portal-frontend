import type dayjs from 'dayjs'

import { type ListingStatus, type ListingType } from '@configs/filters'

import {
  type ApiClass,
  type ApiImageSearchItem,
  type ApiLastStatus,
  type ApiQueryParams,
  type ApiSortBy,
  type ApiStatus,
  type QualitativeInsightValue,
  type RawQuery
} from 'services/API'
// Direct file import (not the `services/API` barrel) to avoid the
// Search ↔ API module cycle: the barrel pulls APIEstimate → Search/index back
// into this file, leaving `locationTypes` undefined when the spread below runs.
import { locationTypes } from 'services/API/types/locations'
import { type Primitive } from 'utils/formatters'

// MapPoint: a selected map point — `center` is [lat, lng], optional integer-km
// `radius` triggers the Repliers point+radius search, optional `label` is the
// address text shown in MapTitle and is NEVER serialized to the URL.
export type MapPoint = {
  center: [number, number]
  radius?: number
  label?: string
}

// Every filter key that scopes a search to a location — the canonical set to
// clear when leaving or replacing a location selection. `locationTypes` are the
// name-based geo filters (state/area/city/neighborhood), `location` is the legacy
// path string, `locationId` the modern id.
export const locationFilterKeys = [
  ...locationTypes,
  'location',
  'locationId',
  'externalLocationId'
] as const

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

export const soldRangeKeys = [
  'lastDay',
  'last3d',
  'lastWeek',
  'last30d',
  'last90d',
  'last180d',
  'lastYear'
] as const

export const cancelledRangeKeys = [
  'lastDay',
  'last3d',
  'lastWeek',
  'last30d',
  'last90d',
  'last180d',
  'lastYear'
] as const

export const activeRangeKeys = [
  'lastDay',
  'last3d',
  'lastWeek',
  'last30d',
  'last90d',
  'moreThan15d',
  'moreThan30d',
  'moreThan60d',
  'moreThan90d'
] as const

export type DaysOnMarket = (typeof daysOnMarket)[number]
export type SoldWithin = (typeof soldWithin)[number]
export type SoldRangeKey = (typeof soldRangeKeys)[number]
export type CancelledRangeKey = (typeof cancelledRangeKeys)[number]
export type ActiveRangeKey = (typeof activeRangeKeys)[number]

export interface Filters {
  listingType?: ListingType | ListingType[]
  listingStatus?: ListingStatus | ListingStatus[]

  coverImage?: string
  imageSearchItems?: ApiImageSearchItem[]
  queries?: RawQuery[]

  pageNum?: number
  sortBy?: ApiSortBy

  // Geo-location filters
  state?: string | string[]
  area?: string | string[]
  city?: string | string[]
  neighborhood?: string | string[]
  location?: string | string[] // Alternative geo-filter: [area] or [area]|[city] or [area]|[city]|[neighborhood]
  locationId?: string | string[] // Location ID filter
  // External overlay location ids (`<overlayId>-<rest>`, e.g. schools) — never
  // sent to the API; resolved to polygons and searched via POST queries
  externalLocationId?: string | string[]

  minPrice?: number
  maxPrice?: number
  minBaths?: number
  minBedrooms?: number
  minParkingSpaces?: number
  minGarageSpaces?: number
  propertyType?: string | string[]
  status?: ApiStatus | ApiStatus[]
  lastStatus?: ApiLastStatus | ApiLastStatus[]
  type?: 'sale' | 'lease'
  class?: ApiClass | ApiClass[]
  amenities?: string[]
  minSqft?: number
  maxSqft?: number
  maxListDate?: string
  minListDate?: string
  minUnavailableDate?: string
  maxUnavailableDate?: string
  minSoldDate?: string
  maxSoldDate?: string
  daysOnMarket?: DaysOnMarket
  soldWithin?: SoldWithin
  soldRange?: string
  activeRange?: string
  cancelledRange?: string

  minYearBuilt?: number | null
  maxYearBuilt?: number | null

  maxMaintenanceFee?: number | null

  minLotSizeSqft?: number | null
  maxLotSizeSqft?: number | null

  // Lot frontage (lot width along the street), in feet
  minLotWidth?: number | null
  maxLotWidth?: number | null

  minQuality?: number
  maxQuality?: number

  overallQuality?: QualitativeInsightValue | null
  livingRoomQuality?: QualitativeInsightValue | null
  diningRoomQuality?: QualitativeInsightValue | null
  kitchenQuality?: QualitativeInsightValue | null
  bedroomQuality?: QualitativeInsightValue | null
  bathroomQuality?: QualitativeInsightValue | null
  frontOfStructureQuality?: QualitativeInsightValue | null

  search?: string

  officeId?: string | number
  agentId?: string | number
  brokerage?: string | string[]

  style?: string[]
  basement?: string[]

  openHouse?: OpenHouseOption

  /** Routes the request to /listings/featured/[slug]. Fake filter — stripped before API call. */
  source?: 'listings' | 'featured'
  slug?: string
}

export const openHouseOptions = ['any', 'today', 'thisWeekend'] as const
export type OpenHouseOption = (typeof openHouseOptions)[number]

// sale/lease axis — independent of the active/sold axis. Absent means sale.
export type TransactionType = NonNullable<Filters['type']>
// cross-filter options for transformers(today only the transaction type)
export type TransformOptions = { type?: TransactionType }

export type FilterKeys = keyof Filters

export const simpleFilters = [
  'minPrice',
  'maxPrice',
  'minBedrooms',
  'minBaths',
  'minGarageSpaces',
  'minParkingSpaces',
  'minYearBuilt',
  'maxYearBuilt',
  'maxMaintenanceFee',
  'minLotSizeSqft',
  'maxLotSizeSqft',
  'minLotWidth',
  'maxLotWidth',
  'minSqft',
  'maxSqft'
] as const satisfies readonly (keyof Filters)[]

type SimpleFilter = (typeof simpleFilters)[number]

export type SimpleTransformers = Record<
  SimpleFilter,
  (value: Primitive) => Partial<ApiQueryParams>
>

export type OptionalTransformers = {
  daysOnMarket: Record<DaysOnMarket, (date: dayjs.Dayjs) => Partial<Filters>>
  soldWithin: Record<SoldWithin, (date: dayjs.Dayjs) => Partial<Filters>>
  soldRange: Record<
    string,
    (date: dayjs.Dayjs, options?: TransformOptions) => Partial<Filters>
  >
  cancelledRange: Record<string, (date: dayjs.Dayjs) => Partial<Filters>>
  activeRange: Record<ActiveRangeKey, (date: dayjs.Dayjs) => Partial<Filters>>
  openHouse: Record<
    OpenHouseOption,
    (date: dayjs.Dayjs) => Partial<ApiQueryParams>
  >
}
