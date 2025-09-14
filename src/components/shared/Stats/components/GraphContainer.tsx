import React, { forwardRef } from 'react'
import type { ForwardedRef, ReactNode } from 'react'

import { Box, Paper, Skeleton, Stack } from '@mui/material'

interface GraphContainerProps {
  loading?: boolean
  titleSlot?: ReactNode
  buttonsSlot?: ReactNode
  bulletsSlot?: ReactNode
  timeRangeSlot?: ReactNode
  children: ReactNode
}

export const GraphContainer = forwardRef<HTMLDivElement, GraphContainerProps>(
  function GraphContainer(
    { titleSlot, buttonsSlot, bulletsSlot, timeRangeSlot, loading, children },
    ref: ForwardedRef<HTMLDivElement>
  ) {
    return (
      <Paper ref={ref} sx={{ p: 3 }}>
        <Stack spacing={{ xs: 2, md: 3 }}>
          <Stack
            spacing={2}
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="space-between"
          >
            {titleSlot}

            {buttonsSlot}
          </Stack>
          <Stack
            spacing={3}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            {bulletsSlot}

            {timeRangeSlot}
          </Stack>

          {loading ? (
            <Skeleton
              variant="rounded"
              sx={{ bgcolor: 'common.white' }}
              height={250}
            />
          ) : (
            <Box
              sx={{
                mr: -1,
                height: 250,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {children}
            </Box>
          )}
        </Stack>
      </Paper>
    )
  }
)
