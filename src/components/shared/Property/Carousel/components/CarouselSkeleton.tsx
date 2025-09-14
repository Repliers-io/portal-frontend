import { Stack } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { SkeletonCard } from '@shared/Property'

const CarouselSkeleton = () => {
  return (
    <Stack
      py={gridConfig.cardCarouselSpacing}
      spacing={gridConfig.cardCarouselSpacing}
      direction="row"
      justifyContent="center"
    >
      <SkeletonCard />
      <SkeletonCard sx={{ display: { xs: 'none', md: 'block' } }} />
      <SkeletonCard sx={{ display: { xs: 'none', md: 'block' } }} />
      <SkeletonCard sx={{ display: { xs: 'none', lg: 'block' } }} />
    </Stack>
  )
}

export default CarouselSkeleton
