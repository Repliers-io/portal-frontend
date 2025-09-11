import React from 'react'
import Image from 'next/legacy/image'

import { Box } from '@mui/material'

import content from '@configs/content'

const { siteName, siteSplashscreen } = content

const BannerImage = () => {
  return (
    <Box
      width="100%"
      height="100%"
      position="absolute"
      bgcolor="background.default"
    >
      <Image
        unoptimized
        layout="fill"
        loading="lazy"
        priority={false}
        objectFit="cover"
        objectPosition="center"
        src={siteSplashscreen}
        alt={siteName}
      />
    </Box>
  )
}

export default BannerImage
