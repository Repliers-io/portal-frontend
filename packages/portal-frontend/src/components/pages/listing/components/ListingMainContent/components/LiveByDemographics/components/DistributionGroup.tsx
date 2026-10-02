'use client'

import { Box, Stack, Typography } from '@mui/material'

import { demographicsPalette } from '@configs/colors'

import useIntersectionObserver from 'hooks/useIntersectionObserver'

import type { LiveByDistributionGroup } from '../types'

import { formatPercentage } from './utils'

const DistributionBar = ({
  percentage,
  color,
  visible,
  delay
}: {
  percentage: number
  color: string
  visible: boolean
  delay: number
}) => (
  <Box
    sx={{
      flex: 1,
      height: 4,
      bgcolor: 'action.hover',
      borderRadius: 1,
      overflow: 'hidden'
    }}
  >
    <Box
      sx={{
        width: visible ? `${percentage}%` : '0%',
        height: '100%',
        bgcolor: color,
        transition: 'width 0.4s ease-out',
        transitionDelay: visible ? `${delay}ms` : '0ms'
      }}
    />
  </Box>
)

export const DistributionGroup = ({
  title,
  items,
  hideZero = false
}: Omit<LiveByDistributionGroup, 'kind'> & { hideZero?: boolean }) => {
  const [visible, ref] = useIntersectionObserver(0.3)

  const visibleItems = hideZero
    ? items.filter(({ percentage }) => percentage > 0)
    : items

  return (
    <Stack ref={ref} spacing={1}>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      <Stack spacing={0.75}>
        {visibleItems.map(({ label, percentage, color }, index) => (
          <Stack key={label} direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" sx={{ width: 140, flexShrink: 0 }}>
              {label}
            </Typography>
            <DistributionBar
              percentage={percentage}
              color={
                color ?? demographicsPalette[index % demographicsPalette.length]
              }
              visible={visible}
              delay={index * 60}
            />
            <Typography
              variant="body2"
              sx={{ width: 36, textAlign: 'right', flexShrink: 0 }}
            >
              {formatPercentage(percentage)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
