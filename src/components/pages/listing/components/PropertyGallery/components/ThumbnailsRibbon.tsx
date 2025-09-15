import React, { useEffect, useMemo, useRef } from 'react'
import Image from 'next/legacy/image'

import { Box, IconButton, Stack } from '@mui/material'

import propsConfig from '@configs/properties'

import { useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useProperty } from 'providers/PropertyProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import useResponsiveValue from 'hooks/useResponsiveValue'
import { getCDNPath } from 'utils/urls'

import { verticalThumbHeight, verticalThumbWidth } from '../constants'

import { SlideshowButton, ThumbnailsCount } from '.'

const ThumbnailsRibbon = ({
  active = 0,
  onClick
}: {
  active: number
  onClick?: (index: number) => void
}) => {
  const features = useFeatures()
  const clientSide = useClientSide()
  const galleryRef = useRef<HTMLDivElement>(null)
  const { mobile, desktop, wideScreen } = useBreakpoints()
  const minImages = useResponsiveValue({ xs: 3, sm: 4, md: 2, lg: 4 }) || 1
  // need to use gallery hook here to open up GalleryDialog when clicking on the
  // preview image (the first, semi-hidden "Open Gallery" button)
  const { showDialog: showGallery } = useDialog('slideshow')
  const { property, blurred } = useProperty()
  let images = [...property.images] as string[]
  const spacing = 16 // px

  // limit the number of visible images to the max ribbon side if we need to blur them all
  if (blurred) images = images.slice(0, minImages)
  const imageSize = blurred ? 'small' : 'medium'

  const paddedWidth = useMemo(() => {
    if (!galleryRef.current || !galleryRef.current.children.length) return 0
    const thumbnailElement = galleryRef.current.children[0]
    const thumbnailStyles = window.getComputedStyle(thumbnailElement)
    return parseFloat(thumbnailStyles.width) + spacing
  }, [galleryRef.current])

  const scrollTo = (
    index: number,
    behavior: 'instant' | 'smooth' = 'smooth'
  ) => {
    if (clientSide && galleryRef.current) {
      // desktops
      if (desktop) {
        // VERTICAL RIBBON
        const paddedHeight = verticalThumbHeight + spacing
        const currentIndex = Math.round(
          galleryRef.current.scrollTop / paddedHeight
        )

        let scrollShift = wideScreen // 2x2 grid on wide desktop
          ? Math.round((index + (features.pdpSlideshow ? 1 : 0)) / 2) *
              paddedHeight -
            paddedHeight
          : index * paddedHeight

        // go up one row if the clicked image is in the first row
        if (!wideScreen && index === currentIndex) {
          scrollShift -= paddedHeight
        }

        galleryRef.current.scrollTo({
          top: scrollShift,
          behavior
        })
      } else {
        // HORIZONTAL RIBBON
        let scrollShift = index * paddedWidth - paddedWidth
        if (!mobile) scrollShift -= paddedWidth / 2 - 8

        galleryRef.current.scrollTo({
          left: scrollShift,
          behavior
        })
      }
    }
  }

  const handleClick = (index: number) => {
    scrollTo(index)
    setTimeout(() => onClick?.(index), mobile ? 200 : 0)
  }

  const handleSlideshowClick = () => {
    showGallery({ images, active, tab: 'grid' })
  }

  useEffect(() => {
    // very special case where we should not move the scroll when switching to second image (0 is the first)
    if (active === 1 && wideScreen) return
    scrollTo(active)
  }, [active])

  useEffect(() => {
    // skip the first row of images on wide desktop
    if (desktop) {
      if (active < 2) {
        scrollTo(wideScreen ? 2 : 1, 'instant')
      } else {
        scrollTo(active, 'instant')
      }
    }
  }, [property, clientSide])

  // cant use 100vw in desktop browsers because of different scrollbar width
  // more about the isssue here: https://www.smashingmagazine.com/2023/12/new-css-viewport-units-not-solve-classic-scrollbar-problem/
  // TODO: add state for it and subscribe to window resize event to better handle it
  const browserWidth = document.body.clientWidth
    ? `${document.body.clientWidth}px`
    : '100vw'

  const imageSx = useMemo(
    () => ({
      width: {
        xs: `calc((${browserWidth} - 64px) / 3)`, // 64px = (gap2 + gap2 + gap2 + gap2 ) * 8px
        sm: `calc((${browserWidth} - 96px) / 4)`, // 96px = (gap3 + gap2 + gap2 + gap3 ) * 8px
        md: `${verticalThumbWidth}px`
      },
      height: { xs: 'auto', md: verticalThumbHeight },
      display: 'block',
      aspectRatio: '3/2',
      overflow: 'hidden',
      position: 'relative',
      bgcolor: 'background.default',
      borderRadius: 2,
      ...(blurred && {
        pointerEvents: 'none',
        '& img': { filter: `blur(${propsConfig.blurredImageRadius}px)` }
      })
    }),
    [browserWidth, blurred]
  )

  const firstLastElementsPadding = {
    '&:first-child': { pl: { xs: 2, sm: 3, md: 0 } },
    '&:last-child': { pr: { xs: 2, sm: 3, md: 0 } }
  }

  // hide the thumbnail ribbon if there is only one image and we are on mobile/tablet
  if (!desktop && images.length < 2) return null

  return (
    <Box
      sx={{
        position: 'relative',
        mt: { xs: 0, sm: 0, md: 0 },
        mx: { xs: -2, sm: -3, md: 0 }
      }}
    >
      <Stack
        ref={galleryRef}
        spacing={2}
        direction="row"
        flexWrap={{ xs: 'nowrap', md: 'wrap' }}
        sx={{
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': { display: 'none' },

          overflowX: { xs: 'visible', md: 'hidden' },
          overflowY: { xs: 'hidden', md: 'scroll' },

          willChange: 'scroll-position',
          transform: 'translateZ(0)',
          clipPath: 'padding-box',
          width: {
            xs: '100vw',
            md: verticalThumbWidth,
            lg: verticalThumbWidth * 2 + spacing
          },
          height: {
            xs: 'auto',
            md: verticalThumbHeight * 2 + spacing
          }
        }}
      >
        {images.length > 1 && ( // do not show thumbnail of the one image only
          <>
            {features.pdpSlideshow &&
              wideScreen &&
              images.length > minImages && (
                <SlideshowButton onClick={handleSlideshowClick} />
              )}
            {images.map((img, index) => {
              // skip the first image if there are less than 4 images
              return images.length < minImages && index === 0 ? null : (
                <Box key={index} sx={firstLastElementsPadding}>
                  <IconButton
                    sx={imageSx}
                    disableFocusRipple
                    onClick={() => handleClick(index)}
                  >
                    <Image
                      priority // all of the small images should be preloaded to be used as thumbnails
                      unoptimized
                      layout="fill"
                      objectFit="cover"
                      src={getCDNPath(img, imageSize)}
                      alt={`${index + 1} of ${images.length}`}
                    />
                  </IconButton>
                </Box>
              )
            })}
          </>
        )}
        {images.length < minImages &&
          Array.from({
            length:
              // NOTE: we use the first image in the main placeholder, so the thumbnails grid is (images.length - 1)
              images.length <= 1 ? minImages : minImages - images.length + 1
          }).map((item, index) => (
            <Box key={index - 100} sx={firstLastElementsPadding}>
              <Box sx={imageSx} />
            </Box>
          ))}
      </Stack>
      {images.length > minImages && <ThumbnailsCount value={images.length} />}
    </Box>
  )
}

export default ThumbnailsRibbon
