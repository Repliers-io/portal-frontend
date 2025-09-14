import React from 'react'

import { Stack } from '@mui/material'

import { type EstimateData } from '@configs/estimate'

import { useEstimate } from 'providers/EstimateProvider'

import PriceTrendCard from './components/PriceTrendCard'
import PriceTrendsGraph from './components/PriceTrendsGraph'

const analyze = (estimateData: EstimateData, numMonths: number) => {
  const data = estimateData.history.mth
  const sortedDates = Object.keys(data).reverse()
  const thisMonth = data[sortedDates[sortedDates.length - 1]].value
  const prevMonth =
    sortedDates.length > numMonths
      ? data[sortedDates[sortedDates.length - 1 - numMonths]].value
      : thisMonth

  return (thisMonth / prevMonth - 1) * 100
}

const PriceTrends = () => {
  const { estimateData } = useEstimate()

  if (!estimateData) return null

  return (
    <Stack
      gap={3}
      width="100%"
      display="grid"
      direction="row"
      gridTemplateColumns={{
        xs: '1fr',
        md: 'calc(33.33% - 16px) calc(66.66% - 8px)'
        // split the 24px gap between the two uneven columns
        // so the final formula would be (N + 24) + (2N+24) = 100%
      }}
    >
      <Stack
        spacing={3}
        width="100%"
        direction={{ xs: 'column', sm: 'row', md: 'column' }}
      >
        <PriceTrendCard
          color="primary"
          title="Yearly change"
          value={analyze(estimateData, 12)}
        />
        <PriceTrendCard
          color="secondary"
          title="Past 90 days"
          value={analyze(estimateData, 3)}
        />
        <PriceTrendCard
          color="primary"
          title="Past 30 days"
          value={analyze(estimateData, 1)}
        />
      </Stack>

      <PriceTrendsGraph />
    </Stack>
  )
}

export default PriceTrends
