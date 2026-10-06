'use client'

import { useMemo, useRef, useState } from 'react'

import { Box } from '@mui/material'

import {
  type ChartStatsParams,
  type ChartTimeRange,
  type LocationStatsParams
} from '@shared/Stats'

import { useChartData, useWidgetData } from '../hooks'

import { InventoryGraph, PriceTimelineGraph } from '.'

export const GraphsPanel = (params: LocationStatsParams) => {
  const [timeRange, setTimeRange] = useState<ChartTimeRange>(12) // ONE_YEAR equivalent
  const { name = '', ...searchParams } = params

  const { inventory } = useWidgetData(searchParams)

  // Memoize params to prevent unnecessary hook re-runs
  const chartParams: ChartStatsParams = useMemo(
    () => ({
      ...searchParams,
      type: 'sale',
      timeRange
    }),
    [JSON.stringify(searchParams), timeRange]
  )

  const { data } = useChartData(chartParams)

  const hasChartData =
    !!data &&
    (Object.keys(data?.soldPrice?.mth || {}).length > 0 ||
      Object.keys(data?.daysOnMarket?.mth || {}).length > 0)

  // Once we have valid chart data, never hide the panel — inventory graph
  // (градусник) is independent of chart loading and must stay visible
  // while the user switches time ranges.
  const everHadData = useRef(false)
  if (hasChartData) everHadData.current = true

  if (!everHadData.current && !hasChartData) return null

  return (
    <Box
      gap={4}
      display="grid"
      className="graphs-panel"
      gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr 1fr' }}
      sx={{
        '& > :nth-of-type(1)': {
          gridColumn: { md: '1 / span 2' }
          // make the first item span two columns on md and up
        }
      }}
    >
      <PriceTimelineGraph
        name={name}
        data={data}
        timeRange={timeRange}
        onRangeChange={setTimeRange}
      />
      <InventoryGraph value={inventory} />
    </Box>
  )
}
