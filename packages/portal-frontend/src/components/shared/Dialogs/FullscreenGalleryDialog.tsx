/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from 'react'

import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack
} from '@mui/material'

import features from '@configs/features'
import { AiSubmitButton, GalleryControls, StarButton } from '@shared/Photos'

import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'
import useBreakpoints from 'hooks/useBreakpoints'

import { BaseFullscreenDialog } from '.'

const dialogName = 'fullscreen-gallery'

export const FullscreenGalleryDialog = () => {
  const { getOptions } = useDialog<GalleryDialogProps>(dialogName)
  const { images = [], active: initialActiveIndex = 0 } = getOptions()
  const { visible, hideDialog } = useDialog(dialogName)
  const [active, setActive] = useState(initialActiveIndex)
  const [loaded, setLoaded] = useState(true)
  const { mobile } = useBreakpoints()

  const activeImage = images[active]

  const dialogTitle =
    images.length > 1 ? `${active + 1} / ${images.length}` : ''

  const preloadImage = useCallback(
    (index: number) => {
      setLoaded(false)
      const img = new Image()
      img.src = images[index]
      img.onload = () => setLoaded(true)
    },
    [images]
  )

  const handleNextClick = useCallback(() => {
    const nextIndex = active < images.length - 1 ? active + 1 : 0
    setActive(nextIndex)
    preloadImage(nextIndex)
  }, [active, images, preloadImage])

  const handlePrevClick = useCallback(() => {
    const prevIndex = active > 0 ? active - 1 : images.length - 1
    setActive(prevIndex)
    preloadImage(prevIndex)
  }, [active, images, preloadImage])

  const handleFirstClick = useCallback(() => {
    setActive(0)
    preloadImage(0)
  }, [preloadImage])

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
      <DialogTitle>{dialogTitle}</DialogTitle>
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
            backgroundImage: `url(${activeImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'opacity 0.2s linear',
            opacity: loaded ? 1 : 0
          }}
        >
          <img
            src={activeImage}
            alt={dialogTitle}
            style={{
              opacity: 0,
              width: '100%',
              height: '100%',
              position: 'absolute'
            }}
          />
        </Box>

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
