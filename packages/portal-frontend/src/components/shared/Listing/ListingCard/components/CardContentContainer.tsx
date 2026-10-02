import React from 'react'

import { Stack } from '@mui/material'

import { type ListingCardSize } from '@defaults/cards-grids'

import { cardEdgeSpacing } from './utils'

export const CardContentContainer = ({
  children,
  size = 'medium'
}: {
  children: React.ReactNode
  size?: ListingCardSize
}) => {
  const sizeMap = size === 'small'
  const sizeDrawer = size === 'drawer'

  const spacing = sizeDrawer ? 2 : sizeMap ? 0.5 : 1

  return (
    <Stack
      justifyContent="space-between"
      spacing={spacing}
      sx={{
        pointerEvents: 'none',
        p: cardEdgeSpacing(size),
        ...(sizeDrawer
          ? {
              inset: 0,
              position: 'absolute',
              background:
                'linear-gradient(180deg, #0001 0%, #0001 50%, #000A 100%)'
            }
          : {})
      }}
    >
      {children}
    </Stack>
  )
}
