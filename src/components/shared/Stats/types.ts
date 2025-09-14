import { type PropertyClass } from '@configs/filters'

export type StatsParams = {
  area?: string | string[]
  city?: string | string[]
  neighborhood?: string | string[]
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
