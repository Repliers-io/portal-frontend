import { useMemo } from 'react'

import { Box, Grid2 as Grid } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'

import { calculateGridLayout, getColumnHeight } from '../utils'

import { GalleryGridImage } from '.'

const GalleryGridView = ({
  images,
  onImageClick
}: {
  images: string[]
  onImageClick: (active?: number) => void
}) => {
  const { tablet } = useBreakpoints()

  const layoutColumns = useMemo(
    () => calculateGridLayout(images.length),
    [images.length]
  )

  return (
    <Box mb={4} sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <Grid container columns={6} spacing={1}>
        {images.map((image, index) => {
          const columns = layoutColumns[index] || 2
          const height = getColumnHeight(columns, tablet)

          return (
            <GalleryGridImage
              key={image}
              index={index}
              image={image}
              height={height}
              columns={columns}
              count={images.length}
              onClick={onImageClick}
            />
          )
        })}
      </Grid>
    </Box>
  )
}

export default GalleryGridView
