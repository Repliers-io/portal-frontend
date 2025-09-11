import { type ApiClass } from 'services/API'
import SearchService from 'services/Search'

import { type ChartStatsParams } from './types'
import { extractArrays, getMaxSoldDate, getMinListDate } from './utils'

export const fetchStatistics = async (
  statistics: string,
  params: ChartStatsParams
) => {
  const { timeRange, propertyClass, ...location } = params

  try {
    const response = await SearchService.fetch({
      ...location,
      statistics,
      listings: false,
      listingStatus: 'sold',
      class: propertyClass as ApiClass,
      maxSoldDate: getMaxSoldDate(),
      minListDate: getMinListDate(timeRange)
      // NOTE: not used anymore, but kept for compatibility
      // listingType: propertyClass === 'all' ? 'allListings' : propertyClass,
    })
    return response!.statistics
  } catch (error) {
    console.error('[Statistics] error fetching data', error)
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
