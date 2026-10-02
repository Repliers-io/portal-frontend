import React from 'react'

import { alpha, Paper } from '@mui/material'

import gridConfig, { type ListingCardSize } from '@configs/cards-grids'

import { cssLength, getCardName } from 'utils/listings'

import { cardActiveRing } from './cardActiveRing'

export const CardContainer = ({
  size = 'medium',
  mlsNumber,
  children,
  onEnter,
  onLeave
}: {
  mlsNumber: string
  size?: ListingCardSize
  children: React.ReactNode
  onEnter?: (mlsNumber: string) => void
  onLeave?: () => void
}) => {
  // shorthands
  const sizeMap = size === 'small'
  const sizeDrawer = size === 'drawer'

  const { width, height } = gridConfig.listingCardSizes[size]

  return (
    <Paper
      className="listing-card"
      data-size={size}
      id={getCardName(mlsNumber, size)}
      sx={{
        p: 0,
        border: 0,
        boxShadow: 1,
        width: `${cssLength(width)} !important`,
        height: `${cssLength(height)} !important`,
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        contentVisibility: 'visible',
        ...(sizeDrawer ? { borderRadius: '8px 8px 0 0' } : {}),
        ...(sizeMap
          ? {
              backdropFilter: 'blur(4px)',
              bgcolor: alpha('#FFFFFF', 0.9)
            }
          : {}),
        transition: 'none',
        ...cardActiveRing
      }}
      onMouseEnter={() => onEnter?.(mlsNumber)}
      onMouseLeave={onLeave}
    >
      {children}
    </Paper>
  )
}
