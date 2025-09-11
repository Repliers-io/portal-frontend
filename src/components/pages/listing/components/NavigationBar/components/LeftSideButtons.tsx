import { useEffect, useRef } from 'react'

import BurstModeOutlinedIcon from '@mui/icons-material/BurstModeOutlined'
import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined'
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined'
import { IconButton, Stack, Tooltip } from '@mui/material'

import { minImagesToShow123Gallery } from '@configs/properties'

import { FallInTransition } from 'components/atoms'

import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useProperty } from 'providers/PropertyProvider'
import useClientSide from 'hooks/useClientSide'

import { propertyDialogContentId } from '../constants'

const LeftSideButtons = ({ sticky }: { sticky: boolean }) => {
  const containerRef = useRef<HTMLElement | null>(null)
  const features = useFeatures()
  const { property, blurred } = useProperty()
  const { showDialog: showGallery } = useDialog('gallery')
  const { showDialog: showSlideshow } = useDialog('slideshow')
  const { images } = property
  const active = 0

  const clientSide = useClientSide()

  const handleGalleryClick = () => {
    showGallery({ images, active, tab: 'grid' })
  }

  const handleSlideshowClick = () => {
    showSlideshow({ images, active })
  }

  const handleTopClick = () => {
    ;(containerRef.current || window).scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    containerRef.current = document.getElementById(propertyDialogContentId)
  }, [])

  if (!clientSide) return <Stack spacing={1} sx={{ width: 148 }} />
  return (
    <Stack spacing={1} direction="row" sx={{ width: 148 }}>
      {!blurred && (
        <>
          {features.pdpSlideshow && images.length > 1 && (
            <Tooltip
              arrow
              enterDelay={200}
              placement="bottom-start"
              title="Start Slideshow"
            >
              <IconButton
                color="primary"
                disableFocusRipple
                onClick={handleSlideshowClick}
              >
                <SmartDisplayOutlinedIcon sx={{ fontSize: 24, m: '2px' }} />
              </IconButton>
            </Tooltip>
          )}
          {features.pdpGridGallery &&
            (!features.pdpFullscreenGallery ||
              images.length >= minImagesToShow123Gallery) && (
              <Tooltip
                arrow
                enterDelay={200}
                placement="bottom"
                title="Open Grid Gallery"
              >
                <IconButton
                  color="primary"
                  disableFocusRipple
                  onClick={handleGalleryClick}
                >
                  <ViewDayOutlinedIcon sx={{ fontSize: 24, m: '2px' }} />
                </IconButton>
              </Tooltip>
            )}
        </>
      )}
      <FallInTransition show={sticky}>
        <Tooltip
          arrow
          enterDelay={200}
          placement="bottom"
          title="Back to Gallery"
        >
          <IconButton
            color="primary"
            disableFocusRipple
            onClick={handleTopClick}
          >
            <BurstModeOutlinedIcon
              sx={{ fontSize: 24, m: '2px', transform: 'scaleX(-1)' }}
            />
          </IconButton>
        </Tooltip>
      </FallInTransition>
    </Stack>
  )
}

export default LeftSideButtons
