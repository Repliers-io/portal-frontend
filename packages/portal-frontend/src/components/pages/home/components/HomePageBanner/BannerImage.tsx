'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'

import { Box } from '@mui/material'

import content from '@configs/content'

import { AutoplayVideo } from 'components/atoms'

import useClientSide from 'hooks/useClientSide'

import { randomImage } from './utils'

const { siteName, siteSplashscreen } = content

// When the splashscreen is an array, a random image is picked client-side to
// avoid server/client hydration mismatch. When it is a single string the value
// is deterministic, so it can be rendered in SSR immediately.
const multipleImages = Array.isArray(siteSplashscreen)

const BannerImage = ({
  bgcolor = 'primary.light',
  objectPosition = 'center'
}: {
  bgcolor?: string
  objectPosition?: string
}) => {
  const clientSide = useClientSide()

  const splashSource = useMemo(
    () =>
      multipleImages
        ? clientSide
          ? randomImage(siteSplashscreen)
          : ''
        : siteSplashscreen,
    [clientSide]
  )

  const ready = multipleImages ? clientSide : true
  const videoSource = splashSource.toLowerCase().endsWith('.mp4')

  return (
    <Box width="100%" height="100%" position="absolute" bgcolor={bgcolor}>
      {ready &&
        (videoSource ? (
          <AutoplayVideo
            src={splashSource}
            aria-label={siteName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition
            }}
          />
        ) : (
          <Image
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition }}
            src={splashSource}
            alt={siteName}
          />
        ))}
    </Box>
  )
}

export default BannerImage
