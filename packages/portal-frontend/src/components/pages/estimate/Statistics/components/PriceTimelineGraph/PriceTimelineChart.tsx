import React, { memo } from 'react'
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
  ChartTooltip,
  getMinMaxDays,
  getMinMaxPrice,
  getTickInterval,
  lineProps,
  tooltipProps,
  xAxisProps,
  yAxisProps
} from '@shared/Stats'

import { formatPrice } from 'utils/formatters'
import { pluralize } from 'utils/strings'

export const PriceTimelineChart = memo(
  ({
    data,
    labels
  }: {
    data: any
    labels: { [key: string]: { color: string; label: string } }
  }) => {
    if (!data) return null

    const { soldPrice, daysOnMarket } = data
    const dates = Object.keys(soldPrice?.mth || {})

    // Repliers omits a month bucket entirely when a metric has no values for it,
    // so the two metrics can have different key sets
    const chartData = dates.map((date: string) => ({
      date,
      med: Math.max(0, soldPrice.mth[date]?.med ?? 0) || null,
      medDom: Math.max(0, daysOnMarket?.mth?.[date]?.med ?? 0) || null
    }))

    const minMaxPrice = getMinMaxPrice(chartData.map((d) => d.med))
    const minMaxDays = getMinMaxDays(chartData.map((d) => d.medDom))
    const interval = getTickInterval(chartData.length)

    return (
      <ResponsiveContainer width="100%" height="100%" debounce={300}>
        <LineChart
          data={chartData}
          margin={{ top: 12, bottom: 0, left: 0, right: 0 }}
        >
          <CartesianGrid stroke={divider} />
          <YAxis
            yAxisId="left"
            orientation="left"
            domain={minMaxPrice}
            tickFormatter={(value) => formatPrice(value)}
            {...yAxisProps}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={minMaxDays}
            tickFormatter={(value) =>
              !value
                ? ''
                : pluralize(value, {
                    one: '$ day',
                    many: '$ days'
                  })
            }
            {...yAxisProps}
          />
          <XAxis dataKey="date" interval={interval} {...xAxisProps} />
          <Tooltip
            content={<ChartTooltip labels={labels} />}
            {...tooltipProps}
          />
          <Line
            dataKey="med"
            yAxisId="left"
            stroke={labels['med'].color}
            {...lineProps}
            isAnimationActive={true}
          />
          <Line
            dataKey="medDom"
            yAxisId="right"
            stroke={labels['medDom'].color}
            {...lineProps}
            isAnimationActive={true}
            animationBegin={500}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }
)

PriceTimelineChart.displayName = 'PriceTimelineChart'
