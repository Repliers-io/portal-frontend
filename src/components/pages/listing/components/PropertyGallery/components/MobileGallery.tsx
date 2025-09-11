import { Box } from '@mui/material'

import { Gallery } from '@shared/Photos'

import { ImagePlaceholder } from 'components/atoms'

import { useDialog } from 'providers/DialogProvider'
import { useProperty } from 'providers/PropertyProvider'
import { getIcon } from 'utils/properties'

const MobileGallery = ({
  active = 0,
  onChange
}: {
  active?: number
  onChange?: (index: number) => void
}) => {
  const { showDialog } = useDialog('fullscreen-ribbon')

  const { property, blurred } = useProperty()
  const { images } = property
  const icon = getIcon(property)

  const emptyGallery = !images.length

  const handleGalleryClick = () => {
    if (emptyGallery || blurred) return
    showDialog({ images, active })
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
          <ImagePlaceholder />
        </Box>
      ) : (
        <Gallery
          icon={icon}
          size="normal"
          loading="lazy"
          images={images}
          start={active}
          blurred={blurred}
          onChange={onChange}
        />
      )}
    </Box>
  )
}

export default MobileGallery
