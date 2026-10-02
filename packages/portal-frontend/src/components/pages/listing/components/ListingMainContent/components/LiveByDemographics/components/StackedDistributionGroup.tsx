'use client'

import { Box, Stack, Typography } from '@mui/material'

import { demographicsPalette } from '@configs/colors'

import useIntersectionObserver from 'hooks/useIntersectionObserver'

import type { LiveByDistributionGroup } from '../types'

import { formatPercentage } from './utils'

export const StackedDistributionGroup = ({
  title,
  items,
  hideZero = false
}: Omit<LiveByDistributionGroup, 'kind' | 'variant'> & {
  hideZero?: boolean
}) => {
  const [visible, ref] = useIntersectionObserver(0.3)

  const visibleItems = hideZero
    ? items.filter(({ percentage }) => percentage > 0)
    : items

  return (
    <Stack ref={ref} spacing={1.5}>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      <Box
        sx={{
          height: 8,
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          bgcolor: 'action.hover'
        }}
      >
        {visibleItems.map(({ label, percentage, color }, i) => (
          <Box
            key={label}
            sx={{
              width: visible ? `${percentage}%` : '0%',
              height: '100%',
              bgcolor:
                color ?? demographicsPalette[i % demographicsPalette.length],
              transition: 'width 0.4s ease-out',
              transitionDelay: visible ? `${i * 60}ms` : '0ms'
            }}
          />
        ))}
      </Box>
      <Stack direction="row" flexWrap="wrap" gap={2.5}>
        {visibleItems.map(({ label, percentage, color }, i) => (
          <Stack key={label} direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor:
                  color ?? demographicsPalette[i % demographicsPalette.length],
                borderRadius: 0.5,
                flexShrink: 0,
                alignSelf: 'center',
                mt: '-1px'
              }}
            />
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ width: 28, flexShrink: 0 }}
            >
              {formatPercentage(percentage)}
            </Typography>
            <Typography variant="body2">{label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
