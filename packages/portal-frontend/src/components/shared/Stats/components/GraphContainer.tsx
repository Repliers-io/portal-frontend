import React, { forwardRef } from 'react'
import type { ForwardedRef, ReactNode } from 'react'

import { Box, Paper, Skeleton, Stack } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'

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
    const { mobile } = useBreakpoints()

    return (
      <Paper
        ref={ref}
        sx={{
          overflow: 'visible',
          p: { xs: 0, sm: 2, md: 3 },
          border: { xs: 0, sm: 1 },
          borderColor: { xs: 'transparent', sm: 'divider' }
        }}
      >
        <Stack spacing={3}>
          {mobile ? (
            <>
              <Stack
                spacing={2}
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                justifyContent="space-between"
              >
                {titleSlot}

                {timeRangeSlot}
              </Stack>

              {buttonsSlot}
            </>
          ) : (
            <>
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
            </>
          )}

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
                position: 'relative',
                '& *:focus': { outline: 'none' }
              }}
            >
              {children}
            </Box>
          )}

          {mobile && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {bulletsSlot}
            </Box>
          )}
        </Stack>
      </Paper>
    )
  }
)
