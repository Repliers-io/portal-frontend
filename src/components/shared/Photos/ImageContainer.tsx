import React, { useState } from 'react'
import Image from 'next/legacy/image'

import { Box } from '@mui/material'

import { blurredImageRadius } from '@configs/properties'

import {
  ImagePlaceholder,
  type ImagePlaceholderIconType
} from 'components/atoms'

import { getCDNPath } from 'utils/urls'

import RestrictedMessage, {
  type RestrictedMessageVariant
} from './RestrictedMessage'

const ImageContainer = ({
  src,
  icon,
  size,
  score,
  index,
  blurred = false,
  blurVariant = 'card',
  loading = 'lazy'
}: {
  src: string
  icon: ImagePlaceholderIconType
  score?: number
  index?: number
  loading?: 'lazy' | 'eager'
  // container size prop is different from image size prop
  size: 'small' | 'medium' | 'large'
  blurred?: boolean
  blurVariant?: RestrictedMessageVariant
}) => {
  const [loaded, setLoaded] = useState(false)
  // first element of the gallery should be eagerly loaded
  const imageSrc = getCDNPath(src, size)
  const style = blurred ? { filter: `blur(${blurredImageRadius}px)` } : {}

  return (
    <Box
      {...(score && { title: `SCORE: ${score.toFixed(4)}, IMAGE: ${index}` })}
      sx={{ minWidth: '100%', height: '100%', position: 'relative' }}
    >
      <ImagePlaceholder icon={icon} />
      {Boolean(imageSrc) && (
        <Image
          alt=""
          unoptimized
          layout="fill"
          loading={loading}
          objectFit="cover"
          onLoadingComplete={() => setLoaded(true)}
          src={imageSrc}
          style={style}
        />
      )}
      {blurred && loaded && <RestrictedMessage variant={blurVariant} />}
    </Box>
  )
}

export default ImageContainer
