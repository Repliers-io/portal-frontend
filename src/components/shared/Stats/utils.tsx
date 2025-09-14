import dayjs from 'dayjs'
import type React from 'react'
import {
  type LineProps,
  type TooltipProps,
  type XAxisProps,
  type YAxisProps
} from 'recharts'

import { hint } from '@configs/colors'
import { type PropertyClass } from '@configs/filters'
import typography from '@configs/theme/typography'
import { type ChartAction, type ChartTimeRange } from '@shared/Stats'

import { type ApiStatisticRecord } from 'services/API'
import { formatEnglishPrice, formatPrice } from 'utils/formatters'

export const getActionLabel = (
  actionType: ChartAction,
  propertyClass: PropertyClass,
  t: (key: string) => string
): string => {
  // Special case for condos sold
  if (actionType === 'sold' && propertyClass === 'condo') {
    return t('Charts.soldCondos')
  }
  return t(`Charts.${actionType}`)
}

const formatDate = (date: Date): string => {
  // fix the delta between local and ISO / UTC time
  const timezoneOffset = date.getTimezoneOffset()
  date.setMinutes(date.getMinutes() - timezoneOffset)
  return date.toISOString().split('T')[0]
}

export const getMinListDate = (timeRange: ChartTimeRange): string => {
  const date = new Date()
  date.setDate(1)

  if (timeRange === 6) {
    date.setMonth(date.getMonth() - 6)
  }

  if (timeRange === 12) {
    date.setFullYear(date.getFullYear() - 1)
  }

  if (timeRange === 24) {
    date.setFullYear(date.getFullYear() - 2)
  }

  if (timeRange === 120) {
    date.setFullYear(date.getFullYear() - 10)
  }

  return formatDate(date)
}

export const getMaxSoldDate = () => {
  return dayjs().endOf('month').format('YYYY-MM-DD')
}

// priceFormatter receives second parameter which we shouldnt pass to formatPrice calls
export const priceFormatterShort = (value: number | null) => formatPrice(value)
export const priceFormatter = (value: number | null) =>
  formatEnglishPrice(Math.round(value! / 1000) * 1000)

export const extractArrays = (
  data: Record<string, ApiStatisticRecord>,
  timeRange: number,
  keys: (keyof ApiStatisticRecord)[]
) => {
  const date = Object.keys(data).slice(-timeRange - 1)
  const values = Object.values(data).slice(-timeRange - 1)

  return Object.values(date).map((value, index) => {
    return {
      date: value,
      ...Object.fromEntries(keys.map((key) => [key, values[index][key]]))
    }
  })
}

export const getValues = (data: any[]) => {
  const values = data
    .map((column) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { date, ...rows } = column
      return Object.values(rows)
    })
    .flat() as number[]
  return values
}

export const getMinMaxPrice = (prices: (number | null)[], scale = 10_000) => {
  const validPrices = prices.filter((p): p is number => p != null)
  if (validPrices.length === 0) return [0, 0]

  const min = Math.floor(Math.min(...validPrices) / scale) * scale - scale
  const max = Math.ceil(Math.max(...validPrices) / scale) * scale + scale
  return [Math.max(0, min), max]
}

export const getMinMaxDays = (days: (number | null)[], scale = 5) => {
  const validDays = days.filter((d): d is number => d != null)
  if (validDays.length === 0) return [0, 0]

  const min = Math.floor(Math.min(...validDays) / scale) * scale
  const max = Math.ceil(Math.max(...validDays) / scale) * scale
  return [Math.max(0, min), max]
}

export const getTickInterval = (value: number) =>
  value > 20 ? 2 : value > 10 ? 1 : 0

export const renderMonthTick = (props: any) => {
  const { x, y, payload, index, visibleTicksCount, width } = props

  let show = true
  if (width < 360) {
    show = index % (visibleTicksCount > 7 ? 4 : 3) === 0
  } else if (width < 640) {
    show = index % 2 === 0
  }

  if (!show) return <></>

  let textAnchor: 'start' | 'middle' | 'end' = 'middle'

  if (index === 0) {
    textAnchor = 'start'
  } else if (index === visibleTicksCount - 1) {
    textAnchor = 'end'
  }

  return (
    <text
      x={x}
      y={y + 10}
      fill={hint}
      fontSize={12}
      fontFamily={typography.fontFamily}
      textAnchor={textAnchor}
    >
      {dayjs(payload.value).format('MMM YYYY')}
    </text>
  )
}

export const tooltipProps: TooltipProps<any, any> = {
  offset: 30,
  animationDuration: 300
}

export const lineProps: Omit<LineProps, 'ref'> = {
  type: 'monotone',
  connectNulls: true,
  strokeWidth: 2,
  dot: false,
  activeDot: {
    stroke: '#FFFFFF',
    strokeWidth: 2,
    r: 6
  },
  animationDuration: 1000,
  isAnimationActive: false
}

export const yAxisProps: YAxisProps = {
  minTickGap: 2,
  tickMargin: 10,
  axisLine: false,
  tickLine: false,
  tick: {
    fill: hint,
    fontSize: 12,
    fontFamily: typography.fontFamily
  }
}

export const xAxisProps: XAxisProps = {
  tickMargin: 10,
  minTickGap: 0,
  axisLine: false,
  tickLine: false,
  tick: renderMonthTick
}
