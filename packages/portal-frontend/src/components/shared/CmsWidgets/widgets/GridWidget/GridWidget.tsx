'use client'

import { useState } from 'react'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { GridCenteringContainer } from '@shared/Containers'

import {
  GridWidgetContent,
  type GridWidgetContentProps
} from './GridWidgetContent'

const { listingCardSizes } = gridConfig

export interface GridWidgetProps extends GridWidgetContentProps {
  maxColumns?: number
}

// ── Public component ──────────────────────────────────────────────────────────
export const GridWidget = ({
  maxColumns,
  size = 'medium',
  pagination,
  onResultsChange,
  ...rest
}: GridWidgetProps) => {
  const [empty, setEmpty] = useState(false)
  const minHeight = Number(listingCardSizes[size].height)

  const handleResultsChange = (count: number) => {
    setEmpty(count === 0)
    onResultsChange?.(count)
  }

  return (
    <Box
      data-empty={empty || undefined}
      sx={{
        minHeight,
        width: '100vw',
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        '&[data-empty]': { display: 'none' }
      }}
    >
      <GridCenteringContainer maxColumns={maxColumns}>
        <GridWidgetContent
          size={size}
          pagination={pagination}
          onResultsChange={handleResultsChange}
          {...rest}
        />
      </GridCenteringContainer>
    </Box>
  )
}
