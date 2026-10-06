'use client'

import { Stack, Typography } from '@mui/material'

import { PopulationDonut } from '../../Demographics/components'
import type { LiveByDistributionGroup } from '../types'

export const DonutDistributionGroup = ({
  title,
  items,
  hideZero = false,
  sortByPercentage = false
}: Pick<LiveByDistributionGroup, 'title' | 'items' | 'sortByPercentage'> & {
  hideZero?: boolean
}) => (
  <Stack spacing={1.5}>
    <Typography variant="h6" color="text.secondary">
      {title}
    </Typography>
    <PopulationDonut
      data={items}
      hideZero={hideZero}
      sortByPercentage={sortByPercentage}
    />
  </Stack>
)
