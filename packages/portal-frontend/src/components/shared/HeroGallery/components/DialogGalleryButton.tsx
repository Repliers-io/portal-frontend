import { useState } from 'react'

import { Box, IconButton } from '@mui/material'

import { AspectRatioOutlinedIcon } from '@configs/icons'

import { type PropertyInsights } from 'services/API'
import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'

const buttonSpacing = '25%'

export const DialogGalleryButton = ({
  show = true,
  dragged,
  images = [],
  gridGallery = false,
  active = 0,
  imageInsights
}: {
  show: boolean
  dragged: boolean
  images: string[]
  gridGallery?: boolean
  active?: number
  imageInsights?: PropertyInsights
}) => {
  const [visible, setVisible] = useState(false)

  const { showDialog: showGridGallery } =
    useDialog<GalleryDialogProps>('gallery')
  const { showDialog: showFullscreenGallery } = useDialog('fullscreen-gallery')

  const handleGalleryClick = () => {
    if (gridGallery) {
      showGridGallery({ images, active, imageInsights, tab: 'grid' })
    } else {
      // NOTE: fallback to simple fullscreen gallery as there is no sense
      // to show 1-2-3 grid gallery with less than 6 images in it
      showFullscreenGallery({ images, active })
    }
  }

  return (
    <Box
      sx={{
        inset: `0 ${buttonSpacing}`,
        cursor: 'pointer',
        position: 'absolute',
        pointerEvents: show ? 'auto' : 'none'
      }}
      // `mouseover`, not `mouseenter` — see DesktopGallery
      onMouseOver={() => setVisible(true)}
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
          opacity: visible && !dragged ? 1 : 0,
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
