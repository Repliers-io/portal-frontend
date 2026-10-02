'use client'

import React from 'react'

import { Box, Stack, type StackProps } from '@mui/material'

import { useScrollEdges } from './useScrollEdges'

const sentinelSx = {
  flexShrink: 0,
  width: '1px',
  pointerEvents: 'none' as const
}

type FadeEdgeProps = {
  side: 'left' | 'right'
  visible: boolean
  color?: string
  width: number
}

const FadeEdge = ({ side, visible, color, width }: FadeEdgeProps) => (
  <Box
    aria-hidden
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      [side]: 0,
      width: `${width}px`,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.15s ease-in',
      background: `linear-gradient(to ${
        side === 'left' ? 'right' : 'left'
      }, ${color ?? theme.palette.background.default}, transparent)`
    })}
  />
)

type Props = Omit<StackProps, 'direction' | 'ref'> & {
  /**
   * Ref attached to the inner scroll container. Pass a ref created by the
   * caller — the component attaches it to its `<Stack>` and the caller can
   * reuse it for scroll-related logic (e.g., scroll-into-view of a child).
   */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  /**
   * Solid color the fade gradient starts from on each edge. Defaults to
   * `theme.palette.background.default`. Pass a CSS color string when the
   * scroll container sits on a non-default background.
   */
  fadeColor?: string
  /** Width of each fade overlay in pixels. Defaults to 32. */
  fadeWidth?: number
}

/**
 * Wraps horizontally-scrolling content with subtle fade overlays that appear
 * only when content is hidden behind the corresponding edge. Uses 1px sentinel
 * elements + IntersectionObserver — no scroll listeners or imperative
 * measurements, no re-renders during steady-state scrolling.
 *
 * @example
 * const scrollRef = useRef<HTMLDivElement>(null)
 * <HorizontalScrollFade scrollContainerRef={scrollRef}>
 *   {scrollableItems}
 * </HorizontalScrollFade>
 */
export const HorizontalScrollFade = ({
  scrollContainerRef,
  fadeColor,
  fadeWidth = 32,
  sx,
  children,
  ...rest
}: Props) => {
  const { startSentinelRef, endSentinelRef, atStart, atEnd } =
    useScrollEdges(scrollContainerRef)

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        ref={scrollContainerRef}
        direction="row"
        sx={[
          {
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
        ]}
        {...rest}
      >
        <Box ref={startSentinelRef} aria-hidden sx={sentinelSx} />
        {children}
        <Box ref={endSentinelRef} aria-hidden sx={sentinelSx} />
      </Stack>
      <FadeEdge
        side="left"
        visible={!atStart}
        color={fadeColor}
        width={fadeWidth}
      />
      <FadeEdge
        side="right"
        visible={!atEnd}
        color={fadeColor}
        width={fadeWidth}
      />
    </Box>
  )
}
