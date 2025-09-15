import { useState } from 'react'

import AspectRatioOutlinedIcon from '@mui/icons-material/AspectRatioOutlined'
import { Box, IconButton } from '@mui/material'

import propsConfig from '@configs/properties'

import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useProperty } from 'providers/PropertyProvider'

const buttonSpacing = '25%'

const DialogGalleryButton = ({
  show = true,
  active = 0
}: {
  show: boolean
  active?: number
}) => {
  const {
    property: { images }
  } = useProperty()
  const features = useFeatures()
  const [visible, setVisible] = useState(false)

  const { showDialog: showGridGallery } = useDialog('gallery')
  const { showDialog: showFullscreenGallery } = useDialog('fullscreen-gallery')

  const gridGalleryFlag =
    features.pdpGridGallery &&
    (!features.pdpFullscreenGallery ||
      images.length >= propsConfig.minImagesToShow123Gallery)

  const handleGalleryClick = () => {
    if (gridGalleryFlag) {
      showGridGallery({ images, active, tab: 'grid' })
    } else {
      // NOTE: fallback to simple fullscreen gallery as there is no sense
      // to show 1-2-3 grid gallery with less than 6 images in it
      showFullscreenGallery({ images, active })
    }
  }
  const pdpGallery = features.pdpFullscreenGallery || features.pdpGridGallery

  if (!pdpGallery) return null

  return (
    <Box
      sx={{
        top: 0,
        bottom: 0,
        cursor: 'pointer',
        left: buttonSpacing,
        right: buttonSpacing,
        position: 'absolute',
        pointerEvents: show ? 'auto' : 'none'
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={handleGalleryClick}
    >
      <IconButton
        disableFocusRipple
        sx={{
          top: '50%',
          left: '50%',
          position: 'absolute',
          bgcolor: '#FFF9',
          color: 'primary.dark',
          opacity: visible ? 1 : 0,
          transform: 'translate3d(-50%, -50%, 0)',
          transition: 'opacity 0.2s linear, background 0.2s linear',
          '&:hover': { bgcolor: '#FFFE' }
        }}
      >
        <AspectRatioOutlinedIcon sx={{ fontSize: 48, m: 2 }} />
      </IconButton>
    </Box>
  )
}

export default DialogGalleryButton
