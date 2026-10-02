'use client'

import React, { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { Box, Skeleton, Stack } from '@mui/material'

import palette from '@configs/theme/palette'
import { CardPaper } from '@shared/Containers'
import {
  ChartBulletList,
  ChartRangeSelect,
  type ChartTimeRange
} from '@shared/Stats'

import { formatEnglishPrice } from 'utils/formatters'

import { PriceTimelineChart, PriceTimelineTitle } from '.'

export const PriceTimelineGraph = ({
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

  const { labels, bulletColors, bulletLabels } = useMemo(() => {
    const labelsObj = {
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

    return {
      labels: labelsObj,
      bulletColors: Object.values(labelsObj).map((item) => item.color),
      bulletLabels: Object.values(labelsObj).map((item) => item.label)
    }
  }, [t])

  return (
    <CardPaper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack
          spacing={2}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <PriceTimelineTitle loading={!data}>
            {t('soldPriceAndDaysOnMarketTitle', { name })}
          </PriceTimelineTitle>

          <ChartRangeSelect value={timeRange} onChange={onRangeChange} />
        </Stack>

        <ChartBulletList colors={bulletColors} labels={bulletLabels} />

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
    </CardPaper>
  )
}
