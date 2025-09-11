import { Stack } from '@mui/material'

import { cardCarouselSpacing } from '@configs/cards-grids'
import { SkeletonCard } from '@shared/Property'

const CarouselSkeleton = () => {
  return (
    <Stack
      py={cardCarouselSpacing}
      spacing={cardCarouselSpacing}
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
