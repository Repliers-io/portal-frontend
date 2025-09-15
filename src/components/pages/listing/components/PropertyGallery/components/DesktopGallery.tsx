import React, { useEffect, useState } from 'react'
import Image from 'next/legacy/image'

import { Box, CircularProgress, Stack } from '@mui/material'

import propsConfig from '@configs/properties'
import {
  AiSubmitButton,
  GalleryControls,
  RestrictedMessage,
  StarButton
} from '@shared/Photos'

import { ImagePlaceholder } from 'components/atoms'

import { useFeatures } from 'providers/FeaturesProvider'
import { useProperty } from 'providers/PropertyProvider'
import { getCDNPath } from 'utils/urls'

import { DialogGalleryButton } from '.'

const DesktopGallery = ({
  active = 0,
  onChange
}: {
  active?: number
  onChange?: (index: number) => void
}) => {
  const features = useFeatures()
  const { property, blurred } = useProperty()
  const { images } = property

  const emptyGallery = !images.length
  const [loading, setLoading] = useState(!emptyGallery)

  const activeImage = images[active]
  const [activeImageLarge, setActiveImageLarge] = useState('')
  // default value is `true` because of a good chances user already hovering
  // main image area before the first component render
  const [showControls, setShowControls] = useState(false)

  const handleChange = (index: number) => {
    setLoading(true)
    onChange?.(index)
  }

  const handleNextClick = () => {
    const nextIndex = active < images.length - 1 ? active + 1 : 0
    handleChange(nextIndex)
  }

  const handlePrevClick = () => {
    const prevIndex = active > 0 ? active - 1 : images.length - 1
    handleChange(prevIndex)
  }

  const toggleControls = (e: React.TouchEvent) => {
    setShowControls(!showControls)
    e.preventDefault()
    e.stopPropagation()
  }

  // we introduce this one render delay in source updates
  // to show thumbnail image first and then load full size image on top of it
  useEffect(() => {
    setLoading(true)
    setActiveImageLarge(activeImage)
  }, [activeImage])

  const activeImageUrl = getCDNPath(activeImage, 'small')
  const activeImageLargeUrl = getCDNPath(activeImageLarge, 'large')

  return (
    <Box
      sx={{
        flex: 1,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: 'background.default',
        aspectRatio: { sm: '3/2', md: 'auto' },
        ...(blurred && {
          pointerEvents: 'none',
          '& img': { filter: `blur(${propsConfig.blurredImageRadius}px)` }
        })
      }}
      onTouchEnd={toggleControls}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {emptyGallery ? (
        <ImagePlaceholder />
      ) : (
        <>
          {activeImageUrl && (
            <Box
              sx={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                position: 'absolute'
              }}
            >
              <Image
                alt=""
                priority
                unoptimized
                layout="fill"
                objectFit="cover"
                src={activeImageUrl}
              />
            </Box>
          )}
          {!blurred ? (
            <>
              {activeImageLargeUrl && (
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    opacity: loading ? 0 : 1,
                    transition: 'opacity 0.2s ease-in'
                  }}
                >
                  <Image
                    priority
                    unoptimized
                    layout="fill"
                    objectFit="cover"
                    alt={`Photo ${active + 1} of ${images.length}`}
                    src={activeImageLargeUrl}
                    onLoadingComplete={() => setLoading(false)}
                  />
                </Box>
              )}
              <CircularProgress
                size={16}
                color="inherit"
                sx={{
                  right: 16,
                  bottom: 16,
                  position: 'absolute',
                  opacity: loading ? 1 : 0,
                  transition: 'opacity 0.2s ease-in'
                }}
              />
              {images.length > 1 && (
                <GalleryControls
                  show={showControls}
                  onNext={handleNextClick}
                  onPrev={handlePrevClick}
                />
              )}
              {images.length > 0 && (
                <>
                  <DialogGalleryButton show={showControls} active={active} />

                  <Box
                    sx={{
                      m: 2,
                      left: 0,
                      bottom: 0,
                      position: 'absolute'
                    }}
                  >
                    <Stack spacing={2} direction="row">
                      {features.imageFavorites && (
                        <StarButton image={activeImage} />
                      )}
                      {features.aiImageSearch && (
                        <AiSubmitButton image={activeImage} />
                      )}
                    </Stack>
                  </Box>
                </>
              )}
            </>
          ) : (
            <RestrictedMessage variant="gallery" />
          )}
        </>
      )}
    </Box>
  )
}

export default DesktopGallery
