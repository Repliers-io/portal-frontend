import React from 'react'

import { Box, type BoxProps } from '@mui/material'

import { type ListingCardSize } from '@configs/cards-grids'

type GalleryContainerProps = BoxProps & {
  size: ListingCardSize
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const GalleryContainer = React.forwardRef<
  HTMLDivElement,
  GalleryContainerProps
>(
  (
    { size, onMouseEnter = () => null, onMouseLeave = () => null, children },
    ref
  ) => {
    const sizeDrawer = size === 'drawer'

    return (
      <Box
        ref={ref}
        className="listing-gallery"
        sx={{
          ...(sizeDrawer
            ? {
                height: '100%'
              }
            : {
                aspectRatio: 3 / 2
              }),
          overflow: 'hidden',
          position: 'relative',
          // the page keeps the vertical scroll; Embla takes the horizontal swipe
          touchAction: 'pan-y'
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onMouseEnter}
        onTouchEnd={onMouseLeave}
      >
        {children}
      </Box>
    )
  }
)

GalleryContainer.displayName = 'GalleryContainer'
