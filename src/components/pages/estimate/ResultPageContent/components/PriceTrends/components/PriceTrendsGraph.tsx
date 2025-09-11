import React, { useState } from 'react'

import { Box, Skeleton, Stack } from '@mui/material'

import { getPropertyClass, useChartData } from '@pages/estimate/Statistics'
import {
  ChartBulletList,
  ChartRangeSelect,
  type ChartTimeRange
} from '@shared/Stats'

import { useEstimate } from 'providers/EstimateProvider'

import PriceTrendsChart, { labels } from './PriceTrendsChart'
import PriceTrendsContainer from './PriceTrendsContainer'
import PriceTrendsGraphTitle from './PriceTrendsGraphTitle'

const PriceTrendsGraph = () => {
  const { estimateData } = useEstimate()
  const [timeRange, setTimeRange] = useState<ChartTimeRange>(12) // ONE_YEAR equivalent

  const { address: { neighborhood } = {} } = estimateData?.payload || {}
  // WARN: we do not have property class in the estimate payload, so need to get it from the propertyType
  const propertyClass = getPropertyClass(estimateData?.payload)

  const { data, loading } = useChartData({
    propertyClass,
    neighborhood,
    timeRange
  })

  return (
    <PriceTrendsContainer>
      <Stack
        pr={1}
        spacing={2}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <PriceTrendsGraphTitle loading={loading} />

        <ChartRangeSelect value={timeRange} onChange={setTimeRange} />
      </Stack>

      {neighborhood && (
        <ChartBulletList
          colors={Object.values(labels).map((item) => item.color)}
          labels={Object.values(labels).map((item) => item.label)}
        />
      )}

      <Box sx={{ height: 232 }}>
        {estimateData?.history?.mth && !loading ? (
          <PriceTrendsChart
            neighborhoodData={neighborhood ? data?.soldPrice?.mth : null}
            data={estimateData.history.mth}
            timeRange={timeRange}
          />
        ) : (
          <Skeleton
            height={232}
            variant="rounded"
            sx={{ bgcolor: 'common.white' }}
          />
        )}
      </Box>
    </PriceTrendsContainer>
  )
}

export default PriceTrendsGraph
