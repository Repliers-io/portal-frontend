import React from 'react'
import dayjs from 'dayjs'
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
import palette from '@configs/theme/palette'
import {
  type ChartTimeRange,
  ChartTooltip,
  getMinMaxPrice,
  getTickInterval,
  lineProps,
  tooltipProps,
  xAxisProps,
  yAxisProps
} from '@shared/Stats'

import { formatEnglishPrice, formatPrice } from 'utils/formatters'

export const labels = {
  value: {
    color: palette.secondary.main,
    label: 'Estimated House Price',
    formatter: (v: string) => formatEnglishPrice(v, 0)
  },
  med: {
    color: palette.primary.light,
    label: 'Median Sold Price',
    formatter: (v: string) => formatEnglishPrice(v, 0)
  }
}

const PriceTrendsChart = ({
  data,
  neighborhoodData,
  timeRange
}: {
  data: any // TODO: add type
  neighborhoodData: any | null
  timeRange: ChartTimeRange
}) => {
  const dates = Object.keys(data)
    .reverse()
    .slice(-timeRange - 1)

  const prices = Object.values(data)
    .reverse()
    .slice(-timeRange - 1)
    .map((record: any) => record.value)

  let chartData = dates.map((date, index) => ({
    date,
    value: prices[index],
    med: neighborhoodData?.[date]?.med ? neighborhoodData[date].med : null
  }))

  const values = chartData.map((d) => [d.value, d.med].filter(Boolean)).flat()

  const minMaxPrice = getMinMaxPrice(values)

  // cut in half the number of ticks for mobile screens
  const interval = getTickInterval(chartData.length)

  // Add a placeholder for the first month if the chart is 24 months long
  if (chartData.length === 24) {
    const firstDate = dayjs().subtract(24, 'month').format('YYYY-MM')
    chartData = [
      { date: firstDate, value: null, med: neighborhoodData?.[firstDate]?.med },
      ...chartData
    ]
  }

  return (
    <ResponsiveContainer>
      <LineChart
        data={chartData}
        margin={{ top: 12, bottom: 0, left: 0, right: 8 }}
      >
        <CartesianGrid stroke={divider} />
        <YAxis
          domain={minMaxPrice}
          tickFormatter={(value) => formatPrice(value)}
          {...yAxisProps}
        />
        <XAxis dataKey="date" interval={interval} {...xAxisProps} />
        <Tooltip content={<ChartTooltip labels={labels} />} {...tooltipProps} />
        <Line
          dataKey="value"
          stroke={labels.value.color}
          {...lineProps}
          isAnimationActive={true}
        />
        {neighborhoodData && (
          <Line
            dataKey="med"
            stroke={labels.med.color}
            {...lineProps}
            isAnimationActive={true}
            animationBegin={500}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

export default PriceTrendsChart
