import React, { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Box, type BoxProps } from '@mui/material'

import { ImagePlaceholder } from 'components/atoms'

import type { RenderImageProps } from './HomeView'

interface DefaultImageProps extends RenderImageProps, BoxProps {}

const DefaultImage = ({ imageUrl, ...props }: DefaultImageProps) => {
  const [loading, setLoading] = useState(true)
  const t = useTranslations('Estimates')

  return (
    <Box overflow="hidden" position="relative" {...props} height="100%">
      {loading && <ImagePlaceholder />}
      <Box width="100%" height="100%" position="absolute">
        <Image
          fill
          src={imageUrl}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          unoptimized
          alt={t('housePicture')}
          onLoad={() => setLoading(false)}
        />
      </Box>
    </Box>
  )
}

export default DefaultImage
