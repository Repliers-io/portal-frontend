import React from 'react'

import { alpha, Paper } from '@mui/material'

import gridConfig, { type PropertyCardSize } from '@configs/cards-grids'

import { getCardName } from 'utils/properties'

const CardContainer = ({
  size = 'normal',
  mlsNumber,
  children,
  onEnter,
  onLeave
}: {
  mlsNumber: string
  size?: PropertyCardSize
  children: React.ReactNode
  onEnter?: () => void
  onLeave?: () => void
}) => {
  // shorthands
  const sizeMap = size === 'map'
  const sizeDrawer = size === 'drawer'

  const { width, height } = gridConfig.propertyCardSizes[size]

  return (
    <Paper
      id={getCardName(mlsNumber, sizeMap)}
      sx={{
        p: 0,
        border: 0,
        boxShadow: 0,
        width: `${width}px !important`,
        height: `${height}px !important`,
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
        '&.active': {
          boxShadow: '0 0 0 4px #FD66, 0 0 0 8px #FD66'
        }
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </Paper>
  )
}

export default CardContainer
