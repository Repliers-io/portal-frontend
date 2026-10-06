import React, { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'

import { Box, IconButton, Stack } from '@mui/material'

import listingsConfig from '@configs/listings'

import { useDialog } from 'providers/DialogProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'
import useResponsiveValue from 'hooks/useResponsiveValue'

import { type ImageResolvers } from '../HeroGallery'

import { SlideshowButton, ThumbnailsCount } from '.'

const { thumbHeight, thumbWidth, blurRadius, borderRadius } =
  listingsConfig.gallery

export const ThumbnailsRibbon = ({
  images: propImages = [],
  resolvers,
  active = 0,
  blurred = false,
  slideshowGallery = false,
  onClick
}: {
  images: unknown[]
  resolvers: ImageResolvers
  active?: number
  blurred?: boolean
  slideshowGallery?: boolean
  onClick?: (index: number) => void
}) => {
  const clientSide = useClientSide()
  const galleryRef = useRef<HTMLDivElement>(null)
  const { mobile, desktop, wideScreen } = useBreakpoints()
  const minImages = useResponsiveValue({ xs: 3, sm: 4, md: 2, lg: 4 }) || 1
  // need to use gallery hook here to open up GalleryDialog when clicking on the
  // preview image (the first, semi-hidden "Open Gallery" button)
  const { showDialog: showGallery } = useDialog('slideshow')
  const spacing = 16 // px

  const hash = JSON.stringify(propImages)
  // Depends on the serialised contents, not on `propImages` itself: the parent
  // rebuilds that array every render, so a reference dep would re-run every
  // downstream effect. exhaustive-deps cannot see through the hash and asks for
  // `propImages` back — adding it reintroduces exactly that churn.
  const images = useMemo(() => {
    const imgs = [...propImages]
    // limit the number of visible images to the max ribbon side if we need to blur them all
    return blurred ? imgs.slice(0, minImages) : imgs
  }, [hash, blurred, minImages])

  // Format images for display
  const resolver = blurred ? resolvers.small : resolvers.medium
  const imageUrls = useMemo(
    () => images.map((img) => resolver(img)),
    [images, resolver]
  )

  // Format large images for slideshow
  const largeImageUrls = useMemo(
    () => images.map((img) => resolvers.large(img)),
    [images, resolvers]
  )

  // Measures the mounted DOM node, so it must re-run once the ref goes from
  // null to the element. `galleryRef.current` is not a legal dependency —
  // mutating it does not re-render — and exhaustive-deps says so, but an empty
  // array pins paddedWidth to the 0 returned on the first render. A real fix
  // means measuring from a callback ref or a layout effect into state.
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
        const paddedHeight = thumbHeight + spacing
        const currentIndex = Math.round(
          galleryRef.current.scrollTop / paddedHeight
        )

        let scrollShift = wideScreen // 2x2 grid on wide desktop
          ? Math.round((index + (slideshowGallery ? 1 : 0)) / 2) *
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

    const el = galleryRef.current
    // Mobile: swap the main image only after the ribbon scroll settles, else it
    // janks mid-scroll. scrollend where supported, scroll-idle fallback for iOS.
    if (!mobile || !el) {
      onClick?.(index)
      return
    }

    const controller = new AbortController()
    const { signal } = controller
    let timer: ReturnType<typeof setTimeout>
    const swap = () => {
      clearTimeout(timer)
      controller.abort()
      onClick?.(index)
    }
    const debounce = () => {
      clearTimeout(timer)
      timer = setTimeout(swap, 60)
    }
    el.addEventListener('scrollend', swap, { once: true, signal })
    el.addEventListener('scroll', debounce, { passive: true, signal })
    timer = setTimeout(swap, 60)
  }

  const handleSlideshowClick = () => {
    showGallery({ images: largeImageUrls, active, tab: 'grid' })
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
  }, [images, clientSide])

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
        md: `${thumbWidth}px`
      },
      height: { xs: 'auto', md: thumbHeight },
      display: 'block',
      aspectRatio: '3/2',
      overflow: 'hidden',
      position: 'relative',
      bgcolor: 'background.default',
      borderRadius: borderRadius,
      ...(blurred && {
        pointerEvents: 'none',
        '& img': { filter: `blur(${blurRadius}px)` }
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

          // the ribbon takes the horizontal swipe, the page keeps the vertical scroll;
          // reset at md where the ribbon becomes a vertical scroller
          touchAction: { xs: 'pan-x pan-y', md: 'auto' },
          overscrollBehaviorX: { xs: 'contain', md: 'auto' },

          willChange: 'scroll-position',
          transform: 'translateZ(0)',
          clipPath: 'padding-box',
          width: {
            xs: '100vw',
            md: thumbWidth,
            lg: thumbWidth * 2 + spacing
          },
          height: {
            xs: 'auto',
            md: thumbHeight * 2 + spacing
          }
        }}
      >
        {images.length > 1 && ( // do not show thumbnail of the one image only
          <>
            {slideshowGallery && wideScreen && images.length > minImages && (
              <SlideshowButton onClick={handleSlideshowClick} />
            )}
            {imageUrls.map((src, index) => {
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
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                      src={src}
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
              {/* solid grey fill — match the main ImagePlaceholder (#DDD),
                  not background.default which blends into the page on some tenants */}
              <Box sx={{ ...imageSx, bgcolor: '#DDD' }} />
            </Box>
          ))}
      </Stack>
      {images.length > minImages && <ThumbnailsCount value={images.length} />}
    </Box>
  )
}
