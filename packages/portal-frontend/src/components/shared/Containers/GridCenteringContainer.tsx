'use client'

import React from 'react'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'

const { gridSpacing, gridColumnsMediaQueries } = gridConfig

export const GridCenteringContainer = ({
  gridLayout = true,
  maxWidth,
  maxColumns,
  children
}: {
  gridLayout?: boolean
  maxWidth?: number | string
  maxColumns?: number
  children: React.ReactNode
}) => {
  // When maxColumns is set, limit the snap-to-column media queries to N columns
  // so the container doesn't grow wider than N cards + gaps.
  const columnQueries = React.useMemo(() => {
    if (!maxColumns) return gridColumnsMediaQueries
    return Object.fromEntries(
      Object.entries(gridColumnsMediaQueries).slice(0, maxColumns)
    )
  }, [maxColumns])

  return (
    <Box
      sx={{
        mx: 'auto',
        height: '100%',
        position: 'relative',
        ...columnQueries
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
          px: gridSpacing,
          // The xl edge-margin compensates the extra outer gutter baked into the
          // full-grid column-snap width. A `maxColumns` grid is capped to an exact
          // card count (no slack to absorb), so the margin would only push its
          // left-aligned cards off-centre — suppress it whenever columns are capped.
          mx: { xl: gridLayout && !maxColumns ? -2 : 0 },
          ...(maxWidth && {
            // emulate 'classic' container paddings for string breakpoints ('sm'|'md'|'lg')
            px: typeof maxWidth === 'string' ? { xs: 4, sm: 4, lg: 3 } : 0,
            boxSizing: 'border-box',
            maxWidth
          })
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
