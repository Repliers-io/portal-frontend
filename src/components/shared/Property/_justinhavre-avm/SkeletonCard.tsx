import React from 'react'

import { Skeleton } from '@mui/material'

import { type PropertyCardSize, propertyCardSizes } from '@configs/cards-grids'

const SkeletonCard = ({
  size = 'normal',
  sx = {}
}: {
  size?: PropertyCardSize
  sx?: any
}) => {
  return (
    <Skeleton
      variant="rounded"
      sx={{ ...sx, ...propertyCardSizes[size], borderRadius: 3 }}
    />
  )
}

export default SkeletonCard
