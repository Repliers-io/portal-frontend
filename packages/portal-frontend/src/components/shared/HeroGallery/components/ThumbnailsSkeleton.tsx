import { Skeleton, Stack } from '@mui/material'

import listingsConfig from '@configs/listings'
const { thumbHeight, thumbWidth, borderRadius } = listingsConfig.gallery

export const ThumbnailsSkeleton = () => {
  return (
    <>
      <Skeleton
        variant="rounded"
        sx={{
          flexGrow: 1,
          mx: { xs: -2, sm: 0 },
          borderRadius: { xs: 0, sm: borderRadius },
          width: { xs: 'auto', lg: 632 },
          height: { xs: 'auto', md: thumbHeight * 2 + 16 },
          aspectRatio: { xs: '3/2', md: '' }
        }}
      />

      <Stack
        spacing={2}
        direction="row"
        flexWrap="wrap"
        sx={{
          width: {
            xs: '100%',
            md: thumbWidth,
            lg: thumbWidth * 2 + 16
          },
          height: { xs: 'auto', lg: thumbHeight * 2 + 16 }
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            sx={{
              flex: { xs: 1, md: 'none' },
              borderRadius,
              aspectRatio: { xs: '3/2', md: '' },
              width: { xs: 'auto', md: thumbWidth },
              height: { xs: 'auto', md: thumbHeight },
              // MAGIC: hide the 3rd thumbnail for the tiny desktops (1x2 grid)
              '&:nth-child(3n)': {
                display: { md: 'none', lg: 'block' }
              },
              // hide the 4th thumbnail for mobile (3x1 grid) and smaller desktops
              '&:nth-child(4n)': {
                display: { xs: 'none', sm: 'block', md: 'none', lg: 'block' }
              }
            }}
          />
        ))}
      </Stack>
    </>
  )
}
