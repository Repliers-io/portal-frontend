import { Box } from '@mui/material'

import { Gallery } from '@shared/Photos'

import {
  ImagePlaceholder,
  type ImagePlaceholderIconType
} from 'components/atoms'

import { useDialog } from 'providers/DialogProvider'

import { type ImageResolvers } from '../HeroGallery'

export const MobileGallery = ({
  images = [],
  resolvers,
  active = 0,
  blurred = false,
  fullscreenGallery = false,
  icon = 'house',
  onChange
}: {
  images: unknown[]
  resolvers: ImageResolvers
  active?: number
  blurred?: boolean
  fullscreenGallery?: boolean
  icon?: ImagePlaceholderIconType
  onChange?: (index: number) => void
}) => {
  const { showDialog } = useDialog('fullscreen-ribbon')

  const emptyGallery = !images.length

  // Format images before passing to Gallery
  const resolver = blurred ? resolvers.small : resolvers.medium
  const imageUrls = images.map((img) => resolver(img))

  const handleGalleryClick = () => {
    if (!fullscreenGallery || emptyGallery || blurred) return
    showDialog({ images: imageUrls, active })
  }

  return (
    <Box
      onClick={handleGalleryClick}
      sx={{
        mx: -2,
        position: 'relative',
        willChange: 'transform',
        '& *': { willChange: 'transform' }
      }}
    >
      {emptyGallery ? (
        <Box sx={{ position: 'relative', aspectRatio: '3/2' }}>
          <ImagePlaceholder icon={icon} />
        </Box>
      ) : (
        <Gallery
          icon={icon}
          size="medium"
          loading="lazy"
          images={imageUrls}
          start={active}
          blurred={blurred}
          onChange={onChange}
        />
      )}
    </Box>
  )
}
