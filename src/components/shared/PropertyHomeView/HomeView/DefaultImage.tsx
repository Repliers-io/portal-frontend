import React, { useState } from 'react'
import Image from 'next/legacy/image'

import { Box, type BoxProps } from '@mui/material'

import { ImagePlaceholder } from 'components/atoms'

import type { RenderImageProps } from './HomeView'

interface DefaultImageProps extends RenderImageProps, BoxProps {}

const DefaultImage = ({ imageUrl, ...props }: DefaultImageProps) => {
  const [loading, setLoading] = useState(true)

  return (
    <Box overflow="hidden" position="relative" {...props} height="100%">
      {loading && <ImagePlaceholder />}
      <Box width="100%" height="100%" position="absolute">
        <Image
          unoptimized
          layout="fill"
          src={imageUrl}
          objectFit="cover"
          objectPosition="center"
          alt="House picture"
          onLoadingComplete={() => setLoading(false)}
        />
      </Box>
    </Box>
  )
}

export default DefaultImage
