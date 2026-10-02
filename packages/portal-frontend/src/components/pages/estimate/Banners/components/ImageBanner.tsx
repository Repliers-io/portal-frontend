import React from 'react'
import Image, { type ImageProps } from 'next/image'

import { Box } from '@mui/material'
import { type BoxProps } from '@mui/system'

type ImageBanner = ImageProps & {
  showOverlay?: boolean
  overlayOpacity?: number
  overlayColor?: string
  boxProps?: BoxProps
  sx?: BoxProps['sx']
  bgcolor?: string
}

const ImageBanner: React.FC<ImageBanner> = ({
  showOverlay = false,
  overlayOpacity = 0.6,
  overlayColor = 'primary.main',
  bgcolor = 'background.paper',
  boxProps,
  sx,
  ...props
}) => {
  return (
    <Box
      top={0}
      left={0}
      width="100%"
      height="100%"
      position="absolute"
      bgcolor={bgcolor}
      sx={{
        ...(showOverlay && {
          '&::after': {
            content: '""',
            display: 'block',
            position: 'absolute',
            inset: 0,
            bgcolor: overlayColor,
            opacity: overlayOpacity,
            zIndex: 1
          }
        }),
        ...sx
      }}
      {...boxProps}
    >
      <Image
        fill
        loading="lazy"
        priority={false}
        sizes="(max-width: 900px) 100vw, 50vw"
        style={{ objectFit: 'cover', objectPosition: 'left center' }}
        {...props}
      />
    </Box>
  )
}

export default ImageBanner
