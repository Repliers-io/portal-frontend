'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Box, Skeleton, Stack, Typography } from '@mui/material'

import { TrendingDownIcon, TrendingUpIcon } from '@configs/icons'

import useClientSide from 'hooks/useClientSide'
import { formatEnglishPrice } from 'utils/formatters'

import EstimateValue from './components/EstimateValue'

interface EstimateWidgetProps {
  size?: 'medium' | 'large'
  estimate?: number
  high?: number
  low?: number
  title?: string
}

const EstimateWidget: React.FC<EstimateWidgetProps> = ({
  estimate = 0,
  low = 0,
  high = 0,
  size = 'large',
  title
}) => {
  const t = useTranslations('Widgets')
  const clientSide = useClientSide()
  const widgetTitle = title ?? t('estimatedValueTitle')

  // Medium size layout + responsive design
  if (size === 'medium') {
    if (!clientSide) {
      return <Skeleton variant="rounded" height={68} width={220} />
    }

    return (
      <Stack direction="column">
        <EstimateValue size="medium" value={estimate} title={widgetTitle} />

        <Stack
          mt={1}
          columnGap={3}
          rowGap={1}
          direction={{
            xs: 'column',
            md: 'row'
          }}
          flexWrap="wrap"
        >
          <Stack direction="row" gap={1} alignItems="center">
            <Typography component="div" variant="body2" color="text.secondary">
              <Stack alignItems="center" gap={1} direction="row">
                <TrendingDownIcon color="error" fontSize="small" />
                {t('minRange')}
              </Stack>
            </Typography>
            <Typography variant="body1">
              {formatEnglishPrice(Math.round(low))}
            </Typography>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography component="div" variant="body2" color="text.secondary">
              <Stack alignItems="center" gap={1} direction="row">
                <TrendingUpIcon color="success" fontSize="small" />
                {t('maxRange')}
              </Stack>
            </Typography>
            <Typography variant="body1">
              {formatEnglishPrice(Math.round(high))}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    )
  }

  if (!clientSide) {
    return <Skeleton variant="rounded" height={180} width={320} />
  }

  // Large size layout + responsive design
  return (
    <>
      <EstimateValue value={estimate} title={widgetTitle} />

      <Stack
        gap={{
          xs: 3,
          md: 6
        }}
        direction="row"
        flexWrap={{ xs: 'wrap', md: 'nowrap' }}
      >
        <Box>
          <Typography variant="h3">
            {formatEnglishPrice(Math.round(low))}
          </Typography>
          <Typography component="div" variant="body1" color="text.secondary">
            <Stack alignItems="center" gap={1} direction="row" mt={1}>
              <TrendingDownIcon color="error" />
              {t('minRange')}
            </Stack>
          </Typography>
        </Box>
        <Box>
          <Typography variant="h3">
            {formatEnglishPrice(Math.round(high))}
          </Typography>
          <Typography component="div" variant="body1" color="text.secondary">
            <Stack alignItems="center" gap={1} direction="row" mt={1}>
              <TrendingUpIcon color="success" />
              {t('maxRange')}
            </Stack>
          </Typography>
        </Box>
      </Stack>
    </>
  )
}

export default EstimateWidget
