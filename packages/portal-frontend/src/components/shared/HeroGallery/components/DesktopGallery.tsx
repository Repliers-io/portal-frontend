import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { Box, CircularProgress, Stack } from '@mui/material'

import features from '@configs/features'
import listingsConfig from '@configs/listings'
import {
  AiSubmitButton,
  GalleryControls,
  RestrictedMessage,
  StarButton
} from '@shared/Photos'

import {
  ImagePlaceholder,
  type ImagePlaceholderIconType
} from 'components/atoms'

import { type PropertyInsights } from 'services/API'
import { useDragNavigation } from 'hooks/useDragNavigation'
import { useWheelNavigation } from 'hooks/useWheelNavigation'

import { type ImageResolvers } from '../HeroGallery'

import { DialogGalleryButton } from '.'

export const DesktopGallery = ({
  images = [],
  resolvers,
  active = 0,
  blurred = false,
  gridGallery = false,
  fullscreenGallery = false,
  imageActions = false,
  imageInsights,
  icon = 'house',
  onChange
}: {
  images: unknown[]
  resolvers: ImageResolvers
  active?: number
  blurred?: boolean
  gridGallery?: boolean
  fullscreenGallery?: boolean
  imageActions?: boolean
  icon?: ImagePlaceholderIconType
  imageInsights?: PropertyInsights
  onChange?: (index: number) => void
}) => {
  const emptyGallery = !images.length
  const feedbackPortalRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(!emptyGallery)

  const activeImage = images[active]
  const [activeImageLarge, setActiveImageLarge] = useState<unknown>(
    images[active]
  )
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

  const navigation = {
    active: images.length > 1,
    onPrev: handlePrevClick,
    onNext: handleNextClick
  }
  useWheelNavigation(feedbackPortalRef, navigation)
  const {
    dragged,
    stepped,
    settle,
    handlers: dragHandlers,
    layer
  } = useDragNavigation(navigation)

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

  const activeImageUrl = resolvers.small(activeImage)
  const activeImageLargeUrl = resolvers.large(activeImageLarge)

  // Format all images for dialog and buttons
  const largeImageUrls = images.map((img) => resolvers.large(img))
  const mediumActiveImageUrl = resolvers.medium(activeImage)

  return (
    <Box
      ref={feedbackPortalRef}
      sx={{
        flex: 1,
        borderRadius: listingsConfig.gallery.borderRadius,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: 'background.default',
        aspectRatio: { sm: '3/2', md: 'auto' },
        userSelect: 'none',
        ...(blurred && {
          pointerEvents: 'none',
          '& img': { filter: `blur(${listingsConfig.gallery.blurRadius}px)` }
        })
      }}
      {...dragHandlers}
      onTouchEnd={toggleControls}
      // `mouseover`, not `mouseenter`: the listing browser remounts the gallery under a
      // resting cursor once full details load, and React derives `onMouseEnter` from the
      // replaced node's `mouseout`, which a removed node never dispatches
      onMouseOver={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* the empty gallery, and the ground a dragged photo uncovers */}
      <ImagePlaceholder icon={icon} />
      {!emptyGallery && (
        <>
          <Box sx={{ inset: 0, position: 'absolute' }} {...layer}>
            {activeImageUrl && (
              <Box
                sx={{
                  inset: 0,
                  position: 'absolute'
                }}
              >
                <Image
                  alt=""
                  priority
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                  src={activeImageUrl}
                  onLoad={settle}
                />
              </Box>
            )}
            {!blurred && activeImageLargeUrl && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  opacity: loading ? 0 : 1,
                  // a drag step drops the outgoing photo at once: no fade to outlive the hidden layer
                  transition: stepped ? 'none' : 'opacity 0.2s ease-in'
                }}
              >
                <Image
                  priority
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                  alt={`Photo ${active + 1} of ${images.length}`}
                  src={activeImageLargeUrl}
                  onLoad={() => setLoading(false)}
                />
              </Box>
            )}
          </Box>
          {!blurred ? (
            <>
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
                  {(fullscreenGallery || gridGallery) && (
                    <DialogGalleryButton
                      images={largeImageUrls}
                      imageInsights={imageInsights}
                      active={active}
                      show={showControls}
                      dragged={dragged}
                      gridGallery={gridGallery}
                    />
                  )}

                  {imageActions && (
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
                          <StarButton
                            image={mediumActiveImageUrl}
                            feedbackPortalRef={feedbackPortalRef}
                          />
                        )}
                        {features.aiImageSearch && (
                          <AiSubmitButton image={mediumActiveImageUrl} />
                        )}
                      </Stack>
                    </Box>
                  )}
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
