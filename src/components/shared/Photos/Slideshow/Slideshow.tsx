import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Box } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'
import { getCDNPath } from 'utils/urls'

import { Slide } from '.'

const randomInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min

interface KenBurnsEffectProps {
  images: string[]
  duration?: number
  opacityDuration?: number
  transitionGap?: number
  zoomMin?: number
  zoomMax?: number
}

const KenBurnsEffect: React.FC<KenBurnsEffectProps> = ({
  images,
  duration = 6000,
  opacityDuration = 500,
  transitionGap = 0,
  zoomMin = 1.0,
  zoomMax = 1.2
}: KenBurnsEffectProps) => {
  const { mobile } = useBreakpoints()
  const imageSize = mobile ? 'medium' : 'large'
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loaded, setLoaded] = useState<boolean[]>(
    Array(images.length).fill(false)
  )
  // TODO: fix NodeJS types resolution
  // eslint-disable-next-line no-undef
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const memoizedImages = useMemo(() => images, [images.join()])

  const transforms = useMemo(() => {
    if (!containerRef.current) return []

    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight

    return images.map(() => {
      const startZoom = randomInRange(zoomMin, zoomMax)
      let endZoom
      // find a final zoom level that is different enough from the start level
      // (at least half of the possible zoom range)
      do {
        endZoom = randomInRange(zoomMin, zoomMax)
      } while (Math.abs(startZoom - endZoom) <= Math.abs(zoomMin - zoomMax) / 2)

      // calculate the maximum offsets to keep the image within the container
      const startXOffset = (containerWidth * startZoom - containerWidth) / 2
      const startYOffset = (containerHeight * startZoom - containerHeight) / 2
      const endXOffset = (containerWidth * endZoom - containerWidth) / 2
      const endYOffset = (containerHeight * endZoom - containerHeight) / 2

      // calculate animation start and end positions
      const startX = randomInRange(-startXOffset, startXOffset)
      const startY = randomInRange(-startYOffset, startYOffset)
      const endX = randomInRange(-endXOffset, endXOffset)
      const endY = randomInRange(-endYOffset, endYOffset)

      return {
        start: `scale(${startZoom}) translate3d(${startX}px, ${startY}px, 0)`,
        end: `scale(${endZoom}) translate3d(${endX}px, ${endY}px, 0)`
      }
    })
  }, [memoizedImages, containerRef.current])

  const preloadNextImage = (index: number) => {
    if (index < images.length && !loaded[index]) {
      const img = new Image()
      img.src = getCDNPath(images[index], imageSize)
      img.onload = () => {
        setLoaded((prev) => {
          const newLoaded = [...prev]
          newLoaded[index] = true
          return newLoaded
        })
      }
    }
  }

  useEffect(() => {
    preloadNextImage(0)
    setCurrentIndex(-1)
    setLoaded(Array(images.length).fill(false))
  }, [memoizedImages])

  useEffect(() => {
    if (loaded[0] && currentIndex === -1) {
      setCurrentIndex(0)
    }
  }, [loaded, currentIndex])

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < images.length) {
      timeoutRef.current = setTimeout(() => {
        // loop back to the first image when reaching the end
        const nextIndex = (currentIndex + 1) % images.length
        preloadNextImage(nextIndex)
        setCurrentIndex(nextIndex)
      }, duration + transitionGap)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [currentIndex, memoizedImages, duration])

  return (
    <Box
      ref={containerRef}
      sx={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 'modal',
        position: 'fixed',
        overflow: 'hidden',
        bgcolor: '#000'
      }}
    >
      {transforms.length &&
        images.map((image, index) => (
          <Slide
            key={index}
            image={getCDNPath(image, imageSize)}
            duration={duration}
            active={index === currentIndex}
            opacityDuration={opacityDuration}
            startTransform={transforms[index].start}
            endTransform={transforms[index].end}
          />
        ))}
    </Box>
  )
}

export default KenBurnsEffect
