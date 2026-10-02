import React, { useState } from 'react'
import Image from 'next/image'

import { Box } from '@mui/material'

import listingsConfig from '@configs/listings'

import {
  ImagePlaceholder,
  type ImagePlaceholderIconType
} from 'components/atoms'

import { RestrictedMessage, type RestrictedMessageVariant } from '.'

export const ImageContainer = ({
  src,
  icon,
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
  blurred?: boolean
  blurVariant?: RestrictedMessageVariant
}) => {
  const [loaded, setLoaded] = useState(false)
  const style = blurred
    ? { filter: `blur(${listingsConfig.gallery.blurRadius}px)` }
    : {}

  return (
    <Box
      className="listing-gallery-slide"
      {...(score && { title: `SCORE: ${score.toFixed(4)}, IMAGE: ${index}` })}
      sx={{ minWidth: '100%', height: '100%', position: 'relative' }}
    >
      <ImagePlaceholder icon={icon} />
      {Boolean(src) && (
        <Image
          fill
          alt=""
          src={src}
          unoptimized
          loading={loading}
          onLoad={() => setLoaded(true)}
          style={{ ...style, objectFit: 'cover' }}
        />
      )}
      {blurred && loaded && <RestrictedMessage variant={blurVariant} />}
    </Box>
  )
}
