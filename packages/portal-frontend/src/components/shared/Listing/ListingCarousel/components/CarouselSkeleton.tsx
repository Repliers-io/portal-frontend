import { Box, Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { SkeletonCard } from '@shared/Listing'

export const CarouselSkeleton = ({
  size = 'medium'
}: {
  size?: 'small' | 'medium' | 'large'
}) => {
  const sizeSmall = size === 'small'
  const spacing = sizeSmall
    ? gridConfig.smallCardCarouselSpacing
    : gridConfig.cardCarouselSpacing

  if (sizeSmall) {
    return (
      <Box sx={{ overflowX: 'hidden', width: '100%' }}>
        <Stack
          py={spacing}
          spacing={spacing}
          width="max-content"
          direction="row"
          justifyContent="center"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} size={size} />
          ))}
        </Stack>
      </Box>
    )
  }

  return (
    <Stack
      py={spacing}
      spacing={spacing}
      direction="row"
      justifyContent="center"
    >
      <SkeletonCard size={size} />
      <SkeletonCard size={size} sx={{ display: { xs: 'none', md: 'block' } }} />
      <SkeletonCard size={size} sx={{ display: { xs: 'none', md: 'block' } }} />
      {gridConfig.desktopCarouselColumns[size] > 3 && (
        <SkeletonCard
          size={size}
          sx={{ display: { xs: 'none', lg: 'block' } }}
        />
      )}
    </Stack>
  )
}
