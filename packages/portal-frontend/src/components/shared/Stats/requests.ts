import filtersConfig from '@configs/filters'

import { type ApiClass, APISearch } from 'services/API'
import { processParams } from 'services/Search/adapter'
import { soldDateRange } from 'utils/listings'

import { type ChartStatsParams } from './types'
import { extractArrays, getWindowEnd, getWindowStart } from './utils'

const { statusFilters } = filtersConfig

export const fetchStatistics = async (
  statistics: string,
  params: ChartStatsParams
) => {
  const { timeRange, propertyClass, ...location } = params

  try {
    const response = await APISearch.fetchGraph(
      processParams({
        ...location,
        statistics,
        ...statusFilters.unavailable,
        type: 'sale',
        class: propertyClass as ApiClass,
        ...soldDateRange(getWindowStart(timeRange), getWindowEnd())
      })
    )
    return response.statistics
  } catch {
    return {}
  }
}

export const fetchSalePrice = async (params: ChartStatsParams) => {
  const { soldPrice } = await fetchStatistics(
    'med-soldPrice,avg-soldPrice,grp-mth',
    params
  )

  if (!soldPrice) return null

  return extractArrays(soldPrice.mth, params.timeRange, ['avg', 'med'])
}

export const fetchSold = async (params: ChartStatsParams) => {
  const { soldPrice } = await fetchStatistics('sum-soldPrice,grp-mth', params)

  if (!soldPrice) return null

  return extractArrays(soldPrice.mth, params.timeRange, ['count'])
}

export const fetchDaysOnMarket = async (params: ChartStatsParams) => {
  const { daysOnMarket } = await fetchStatistics(
    'avg-daysOnMarket,med-daysOnMarket,grp-mth',
    params
  )

  if (!daysOnMarket) return null

  return extractArrays(daysOnMarket.mth, params.timeRange, ['avg', 'med'])
}

export const fetchSalesVolume = async (params: ChartStatsParams) => {
  const { soldPrice } = await fetchStatistics('sum-soldPrice,grp-mth', params)

  if (!soldPrice) return null

  return extractArrays(soldPrice.mth, params.timeRange, ['sum'])
}
