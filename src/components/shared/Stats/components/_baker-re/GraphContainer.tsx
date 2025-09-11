import React, { forwardRef } from 'react'
import type { ForwardedRef, ReactNode } from 'react'

import { Box, Paper, Skeleton, Stack } from '@mui/material'

interface GraphContainerProps {
  loading?: boolean
  buttonsSlot?: ReactNode
  bulletsSlot?: ReactNode
  timeRangeSlot?: ReactNode
  children: ReactNode
}

export const GraphContainer = forwardRef<HTMLDivElement, GraphContainerProps>(
  function GraphContainer(
    { buttonsSlot, bulletsSlot, timeRangeSlot, loading, children },
    ref: ForwardedRef<HTMLDivElement>
  ) {
    return (
      <Paper ref={ref} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack
            spacing={2}
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            justifyContent={{ xs: 'center', sm: 'space-between' }}
          >
            <Box>{buttonsSlot}</Box>

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

          {bulletsSlot}
        </Stack>
      </Paper>
    )
  }
)
