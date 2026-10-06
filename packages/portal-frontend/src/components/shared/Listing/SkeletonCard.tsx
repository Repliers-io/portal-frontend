import React from 'react'

import { Skeleton } from '@mui/material'

import gridConfig, { type ListingCardSize } from '@configs/cards-grids'

export const SkeletonCard = ({
  size = 'medium',
  sx = {}
}: {
  size?: ListingCardSize
  sx?: any
}) => {
  return (
    <Skeleton
      variant="rounded"
      sx={{ ...sx, ...gridConfig.listingCardSizes[size] }}
    />
  )
}
