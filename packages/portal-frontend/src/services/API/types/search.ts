import type { Position } from 'geojson'

import { type ApiClass, type ApiCoords, type YesNo } from './common'
import { type ApiLastStatus, type ApiListing } from './listings'

export type ApiQueryParamsAllowedFields =
  | 'details.numBathrooms'
  | 'details.numBathroomsPlus'
  | 'details.numBedrooms'
  | 'details.numBedroomsPlus'
  | 'details.propertyType'
  | 'details.sqft'
  | 'details.style'

export type ApiStatus = 'A' | 'U'

/** RESO StandardStatus values. Mirrors the backend enum. */
export const standardStatuses = [
  'Active',
  'Active Under Contract',
  'Canceled',
  'Closed',
  'Coming Soon',
  'Delete',
  'Expired',
  'Hold',
  'Incomplete',
  'Pending',
  'Withdrawn'
] as const
export type StandardStatus = (typeof standardStatuses)[number]

export type ApiSortBy =
  | 'createdOnAsc'
  | 'createdOnDesc'
  | 'updatedOnAsc'
  | 'updatedOnDesc'
  | 'listPriceAsc'
  | 'listPriceDesc'
  | 'random'
  | 'soldDateAsc'
  | 'soldDateDesc'
  | 'closedDateAsc'
  | 'closedDateDesc'
  | 'soldPriceAsc'
  | 'soldPriceDesc'
  | 'distanceAsc'
  | 'distanceDes'
  | 'qualityAsc'
  | 'qualityDesc'

export type ApiImageSearchItem = {
  value?: string
  url?: string
  type: 'text' | 'image'
  boost: number
}

/**
 * One raw API-level constraint set, sent verbatim as a single element of the
 * POST `queries` array. Keys may be raw fields (e.g. 'raw.BuyerAgentKey');
 * values are NOT run through any transformer. `map` carries a Polygon
 * (Position[][]) or MultiPolygon (Position[][][]) — params inside one query
 * AND together, queries union.
 */
export type RawQuery = Record<
  string,
  string | number | Array<string | number> | Position[][] | Position[][][]
>

export interface ApiQueryParams {
  mlsNumber: string | string[]
  area: string | string[]
  city: string | string[]
  neighborhood: string | string[]
  location: string | string[] // Synthetic filter: [area] or [area]|[city] or [area]|[city]|[neighborhood]
  minPrice?: number
  maxPrice?: number
  streetNumber: string
  streetName: string
  propertyType: string | string[]
  style: string[]
  basement: string[]
  minBedrooms: number
  maxBedrooms: number
  class: ApiClass | ApiClass[]
  listDate: string
  updatedOn: string

  sortBy: ApiSortBy // default: 'createdOnDesc'
  pageNum: number
  resultsPerPage: number
  type: 'sale' | 'lease'
  map: Position[][] | Position[][][]
  minBaths: number
  maxBaths: number
  boardId: number
  status: ApiStatus | ApiStatus[]
  lastStatus: ApiLastStatus | ApiLastStatus[]
  // RESO StandardStatus filter (RESO-vocabulary boards). Multi-value = OR.
  standardStatus?: StandardStatus | StandardStatus[]
  minSoldPrice: string
  maxSoldPrice: string
  minSoldDate: string
  maxSoldDate: string
  minListDate: string
  // Closing date. On RESO boards it is distinct from soldDate, which there marks
  // mutual acceptance rather than a completed sale.
  minClosedDate: string
  maxClosedDate: string
  statistics: string

  // operator - default: 'AND'
  operator: 'AND' | 'OR'

  // condition - default: 'EXACT'
  condition: 'EXACT' | 'CONTAINS'
  hasImages: boolean
  displayAddressOnInternet: YesNo
  displayPublic: YesNo
  minSqft: number
  minParkingSpaces: number

  dtype: number

  search: string
  searchFields: string

  aggregates: string
  // Width of one raw listPrice bucket, per axis. Repliers defaults to 100000 /
  // 500; both only apply when `aggregates` includes listPrice.
  aggregatesListPriceSaleBucketSize: number
  aggregatesListPriceLeaseBucketSize: number
  clusterFields: string
  clusterPrecision: number
  clusterLimit: number
  clusterListingsThreshold: number

  listings: boolean

  officeId: number | string
  agentId: number | string
  // Brokerage name filter. Supports the `contains:` operator, e.g. 'contains:REALOSOPHY';
  // several values are OR-ed
  brokerage: string | string[]
  source: 'listings' | 'featured'
  slug: string

  lat: string
  long: string
  radius: number // in KM
  fields: string
  imagesOrder: 'score' | 'original'
  imageSearchItems: ApiImageSearchItem[]
  queries?: RawQuery[]

  minOpenHouseDate?: string
  maxOpenHouseDate?: string

  searchStrategy?: string
}

export type ApiClusterMapCoords = [number, number][][]

export interface ApiClusterLocation extends ApiCoords {
  map: ApiClusterMapCoords
}

export interface ApiBounds {
  top_left: ApiCoords
  bottom_right: ApiCoords
}

export interface ApiCluster {
  bounds: ApiBounds
  count: number
  location: ApiClusterLocation
  map: ApiClusterMapCoords
  // Present only when the request sets clusterListingsThreshold and
  // count <= threshold — the cluster's listings inlined for individual
  // display, shaped by the clusterFields request param.
  listings?: ApiListing[]
}

export interface ApiAggregates {
  map: {
    clusters: ApiCluster[]
  }
  listPrice?: {
    lease: {
      [range: string]: number
    }
    sale: {
      [range: string]: number
    }
  }
}

export interface ApiStatisticRecord {
  avg: number
  med: number
  count: number
  sum: number
}

export interface ApiStatistic {
  avg: number
  med: number
  mth: { [date: string]: ApiStatisticRecord }
}

export interface ApiQueryResponse {
  page: number
  numPages: number
  pageSize: number
  count: number
  statistics: {
    listPrice?: {
      min: string
      max: string
    }
    soldPrice?: ApiStatistic
    daysOnMarket?: ApiStatistic
    aboveBelowList?: {
      above?: number
      below?: number
    }
  }
  listings: ApiListing[]
  aggregates?: ApiAggregates
}

export interface ApiListingsCountResponse {
  count: number
  lastUpdatedOn?: string // ISO date string of last listing update
}
