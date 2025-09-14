import React from 'react'

import { Stack } from '@mui/material'

import { type LocationStatsParams } from '@shared/Stats'

import { GraphsPanel, WidgetsPanel } from './components'
import { getLocationName } from './utils'

export const LocationStatistics = (params: LocationStatsParams) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name: _, ...searchParams } = params
  const name = getLocationName(params)

  return (
    <Stack spacing={3}>
      <WidgetsPanel {...searchParams} name={name} />
      <GraphsPanel {...searchParams} name={name} />
    </Stack>
  )
}
