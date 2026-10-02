'use client'

import React from 'react'

import { Stack } from '@mui/material'

import { type LocationStatsParams } from '@shared/Stats'

import { GraphsPanel, WidgetsPanel } from './components'
import { getLocationName } from './utils'

export const LocationStatistics = (params: LocationStatsParams) => {
  const { name: _, ...searchParams } = params
  const name = getLocationName(params)

  return (
    <Stack
      className="location-statistics"
      spacing={4}
      sx={{
        '&:empty': {
          display: 'none'
        }
      }}
    >
      <WidgetsPanel {...searchParams} name={name} />
      <GraphsPanel {...searchParams} name={name} />
    </Stack>
  )
}
