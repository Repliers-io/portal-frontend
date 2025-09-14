'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

import {
  Box,
  CircularProgress,
  Paper,
  Skeleton,
  Stack,
  Typography
} from '@mui/material'

import palette from '@configs/theme/palette'
import {
  ChartBulletList,
  ChartRangeSelect,
  type ChartTimeRange
} from '@shared/Stats'

import { formatEnglishPrice } from 'utils/formatters'

import PriceTimelineChart from './PriceTimelineChart'

const PriceTimelineGraph = ({
  name,
  data,
  timeRange,
  onRangeChange
}: {
  name: string
  data?: unknown
  timeRange: ChartTimeRange
  onRangeChange: (range: ChartTimeRange) => void
}) => {
  const t = useTranslations('Charts')

  const labels = {
    med: {
      color: palette.secondary.main,
      label: t('medianSoldPrice'),
      formatter: (v: string) => formatEnglishPrice(v, 0)
    },
    medDom: {
      color: palette.primary.light,
      label: t('medianDaysOnMarket')
    }
  }
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack
          spacing={2}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={3} direction="row" alignItems="center">
            <Typography variant="h3" width={{ xs: '100%', sm: 'auto' }}>
              {t('soldPriceAndDaysOnMarketTitle', { name })}
            </Typography>
            {!data && <CircularProgress size={16} />}
          </Stack>

          <ChartRangeSelect value={timeRange} onChange={onRangeChange} />
        </Stack>

        <ChartBulletList
          colors={Object.values(labels).map((item) => item.color)}
          labels={Object.values(labels).map((item) => item.label)}
        />

        <Box sx={{ height: 232 }}>
          {data ? (
            <PriceTimelineChart data={data} labels={labels} />
          ) : (
            <Skeleton
              height={232}
              variant="rounded"
              sx={{ bgcolor: 'common.white' }}
            />
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

export default PriceTimelineGraph
