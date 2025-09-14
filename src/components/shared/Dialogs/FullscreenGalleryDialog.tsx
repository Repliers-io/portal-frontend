import { useCallback, useEffect, useState } from 'react'
import type React from 'react'

import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack
} from '@mui/material'

import { AiSubmitButton, GalleryControls, StarButton } from '@shared/Photos'

import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import { getCDNPath } from 'utils/urls'

import { BaseFullscreenDialog } from '.'

const dialogName = 'fullscreen-gallery'

const FullscreenGalleryDialog = () => {
  const features = useFeatures()
  const { getOptions } = useDialog<GalleryDialogProps>(dialogName)
  const { images = [], active: initialActiveIndex = 0 } = getOptions()
  const { visible, hideDialog } = useDialog(dialogName)
  const [active, setActive] = useState(initialActiveIndex)
  const [loaded, setLoaded] = useState(true)
  const { mobile } = useBreakpoints()

  const activeImage = images[active]

  const preloadImage = (index: number) => {
    setLoaded(false)
    const img = new Image()
    img.src = getCDNPath(images[index], 'large')
    img.onload = () => setLoaded(true)
  }

  const handleNextClick = useCallback(() => {
    const nextIndex = active < images.length - 1 ? active + 1 : 0
    setActive(nextIndex)
    preloadImage(nextIndex)
  }, [active, images])

  const handlePrevClick = useCallback(() => {
    const prevIndex = active > 0 ? active - 1 : images.length - 1
    setActive(prevIndex)
    preloadImage(prevIndex)
  }, [active, images])

  const handleFirstClick = useCallback(() => {
    setActive(0)
    preloadImage(0)
  }, [active, images])

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      hideDialog()
    }
  }

  useEffect(() => {
    setActive(initialActiveIndex)
  }, [initialActiveIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevClick()
      } else if (e.key === 'ArrowRight') {
        handleNextClick()
      } else if (e.key === 'ArrowUp') {
        handleFirstClick()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        handlePrevClick()
      } else if (e.deltaY > 0) {
        handleNextClick()
      }
    }

    if (visible) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('wheel', handleWheel)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [visible, handlePrevClick, handleNextClick, handleFirstClick])

  return (
    <BaseFullscreenDialog name={dialogName}>
      <DialogTitle>
        {images.length > 1 && `${active + 1} / ${images.length}`}
      </DialogTitle>
      <DialogContent onClick={handleContentClick}>
        <Box
          sx={{
            display: loaded ? 'none' : 'block',
            zIndex: 1,
            left: '64px',
            right: '64px',
            height: '100%',
            textAlign: 'center',
            alignContent: 'center',
            position: 'absolute'
          }}
        >
          <CircularProgress sx={{ color: 'common.white' }} />
        </Box>

        <Box
          sx={{
            zIndex: 2,
            position: 'relative',
            mx: 'auto',
            width: { xs: '100%', sm: '80%' },
            height: '100%',
            maxWidth: '1280px',
            maxHeight: '1024px',
            backgroundImage: `url(${getCDNPath(activeImage, 'large')})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'opacity 0.2s linear',
            opacity: loaded ? 1 : 0
          }}
        />

        {images.length > 1 && (
          <GalleryControls
            variant="dark"
            show={!mobile}
            onNext={handleNextClick}
            onPrev={handlePrevClick}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Stack spacing={1} direction="row" alignItems="center" sx={{ my: -1 }}>
          {features.imageFavorites && (
            <Box sx={{ pl: 4 }}>
              <StarButton variant="outlined" image={activeImage} />
            </Box>
          )}
          {features.imageFavorites && features.aiImageSearch && <Box>or</Box>}
          {features.aiImageSearch && (
            <AiSubmitButton variant="outlined" image={activeImage} />
          )}
        </Stack>
      </DialogActions>
    </BaseFullscreenDialog>
  )
}

export default FullscreenGalleryDialog
