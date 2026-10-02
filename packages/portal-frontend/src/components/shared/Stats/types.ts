import { type PropertyClass } from '@configs/filters'

import { type GeoFilters } from 'services/API'

export type StatsParams = GeoFilters & {
  type?: 'sale' | 'lease'
  propertyClass: PropertyClass | PropertyClass[]
}

export type ChartAction = 'sold' | 'volume' | 'salePrice' | 'daysOnMarket'

export type ChartTimeRange = 6 | 12 | 24 | 120

export type ChartStatsParams = StatsParams & {
  timeRange: ChartTimeRange
}

export type LocationStatsParams = StatsParams & {
  name?: string
}
