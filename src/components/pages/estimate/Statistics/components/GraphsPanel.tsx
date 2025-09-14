import { useState } from 'react'

import { Stack } from '@mui/material'

import { type ChartTimeRange, type LocationStatsParams } from '@shared/Stats'

import { useChartData, useWidgetData } from '../hooks'

import { InventoryGraph, PriceTimelineGraph } from '.'

const GraphsPanel = (params: LocationStatsParams) => {
  const [timeRange, setTimeRange] = useState<ChartTimeRange>(12) // ONE_YEAR equivalent
  const { name = '', ...searchParams } = params

  const { inventory } = useWidgetData(searchParams)
  const { data } = useChartData({ ...searchParams, timeRange })

  return (
    <Stack
      display="grid"
      gridTemplateColumns={{
        xs: '1fr',
        md: 'calc(66.66% - 8px) calc(33.33% - 16px)'
        // split the 24px gap between the two uneven columns
        // so the final formula would be (N + 24) + (2N+24) = 100%
      }}
      spacing={3}
    >
      <PriceTimelineGraph
        name={name}
        data={data}
        timeRange={timeRange}
        onRangeChange={setTimeRange}
      />
      <InventoryGraph value={inventory} />
    </Stack>
  )
}

export default GraphsPanel
