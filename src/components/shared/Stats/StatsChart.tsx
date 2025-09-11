import React, { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { divider } from '@configs/colors'
import {
  type ChartAction,
  getMinMaxDays,
  getMinMaxPrice,
  getTickInterval,
  getValues,
  lineProps,
  tooltipProps,
  xAxisProps,
  yAxisProps
} from '@shared/Stats'

import { type AxisDomain } from 'recharts/types/util/types'

import {
  formatEnglishPrice,
  formatPrice,
  type Primitive
} from 'utils/formatters'
import { pluralize } from 'utils/strings'

import { ChartTooltip } from './components'

export const StatsChart = ({
  data,
  labels,
  colors,
  action = 'sold'
}: {
  data: Record<string, unknown>[]
  labels: string[]
  colors: string[]
  action: ChartAction | null
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { date, ...rows } = data[0]
  const rowNames = Object.keys(rows)

  const values = getValues(data)

  const priceValues = action === 'salePrice' || action === 'volume'

  let domain: AxisDomain | null = null
  let formatFunc = formatPrice

  if (action === 'salePrice') {
    domain = getMinMaxPrice(values, 20_000)
  } else if (action === 'sold') {
    // domain = getMinMaxPrice(values, 200)
    formatFunc = (value) => String(value)
  } else if (action === 'daysOnMarket') {
    domain = getMinMaxDays(values, 10)
    formatFunc = (value: Primitive) =>
      pluralize(Number(value), { one: '$ day', many: '$ days' })
  } else if (action === 'volume') {
    domain = [0, 'auto']
    // domain = getMinMaxPrice(values, 100_000_000)
  }

  const tooltipLabels = useMemo(
    () =>
      Object.fromEntries(
        rowNames.map((row: string, index: number) => {
          return [
            row,
            {
              color: colors[index],
              label: labels[index],
              formatter: (value: Primitive) =>
                priceValues ? formatEnglishPrice(value) : value
            }
          ]
        })
      ),
    [action, rowNames]
  )

  const interval = getTickInterval(data.length)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, bottom: 0, left: 8, right: 8 }}>
        <CartesianGrid stroke={divider} />
        <YAxis
          {...(domain && { domain })}
          tickFormatter={(value) => formatFunc(value)}
          {...yAxisProps}
        />
        <XAxis dataKey="date" interval={interval} {...xAxisProps} />
        <Tooltip
          content={<ChartTooltip labels={tooltipLabels} />}
          {...tooltipProps}
        />

        {rowNames.map((row: string, index: number) => (
          <Line key={row} dataKey={row} stroke={colors[index]} {...lineProps} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
