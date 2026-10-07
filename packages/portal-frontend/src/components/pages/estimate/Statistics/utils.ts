import deepmerge from 'deepmerge'

import { type PropertyClass } from '@configs/filters'
import { dates, defaultWidgetData, monthShift } from '@configs/statistics'
import { type LocationStatsParams } from '@shared/Stats'

import {
  type ApiStatisticResponse,
  type ApiWidgetStatistics
} from 'services/API'
import { propertyTypesOf } from 'utils/filters'
import { capitalize, joinNonEmpty } from 'utils/strings'

export const getPropertyClass = (payload: any): PropertyClass => {
  const { propertyType = '' } = payload?.details || {}
  if (propertyTypesOf('condo').includes(propertyType)) {
    return 'condo'
  }
  return 'residential'
}

export const getLocationName = (params: LocationStatsParams): string => {
  const { name, area, city, neighborhood } = params
  return (
    name ||
    joinNonEmpty([area, city, neighborhood].flat().map(capitalize), ' / ')
  )
}

export type Widget = {
  values: (number | string)[]
  labels: string[]
  dates: string[]
}

export type WidgetsData = typeof defaultWidgetData

const hasVolume = (
  data: typeof defaultWidgetData
): data is typeof defaultWidgetData & { volume: Widget } => 'volume' in data

const extractVolume = (
  widgets: ApiWidgetStatistics
): { volume?: { values: number[] } } => {
  if (!hasVolume(defaultWidgetData)) return {}

  const values = defaultWidgetData.volume.dates.map(
    (date) => widgets?.sold?.volume?.mth?.[date]?.value || 0
  )
  return { volume: { values } }
}

export const toWidgetsData = (response: ApiStatisticResponse): WidgetsData => {
  const { widgets } = response

  const activeListings = [widgets?.active?.count?.value || 0]

  const soldPrices = [widgets?.sold?.prices?.mth[dates[monthShift]]?.med || 0]

  const soldListings = defaultWidgetData.soldListings.dates.map(
    (date) => widgets?.sold?.count?.mth?.[date]?.value || 0
  )

  const daysOnMarket = defaultWidgetData.daysOnMarket.dates.map(
    (date) => widgets?.sold?.dom?.mth?.[date]?.med || 0
  )

  const newListings = defaultWidgetData.newListings.dates.map(
    (date) => widgets?.new?.count?.mth?.[date]?.value || 0
  )

  const volumeData = extractVolume(widgets)

  return deepmerge<WidgetsData, object>(
    defaultWidgetData,
    {
      activeListings: {
        values: activeListings
      },
      soldPrices: {
        values: soldPrices
      },
      newListings: {
        values: newListings
      },
      soldListings: {
        values: soldListings
      },
      daysOnMarket: {
        values: daysOnMarket
      },
      ...volumeData
    },
    { arrayMerge: (_prevArray, newArray) => newArray }
  )
}

export const calculateInventory = (
  response: ApiStatisticResponse | null
): number => {
  if (!response) return 0
  const sold = response.widgets?.sold?.count?.mth?.[dates[1]]?.value || 0
  const active = response.widgets?.active?.count?.value || 0
  return +(sold > 0 ? active / sold : 0)
}

export const toWidgetState = (response: ApiStatisticResponse | null) => ({
  widgets: response ? toWidgetsData(response) : defaultWidgetData,
  inventory: calculateInventory(response)
})
