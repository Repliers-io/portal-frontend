import React from 'react'

import { Skeleton } from '@mui/material'

import gridConfig, { type PropertyCardSize } from '@configs/cards-grids'

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
      sx={{ ...sx, ...gridConfig.propertyCardSizes[size], borderRadius: 3 }}
    />
  )
}

export default SkeletonCard
