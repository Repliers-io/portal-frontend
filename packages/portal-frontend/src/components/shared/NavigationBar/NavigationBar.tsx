import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Box, Container, Stack } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

import { NavigationItems, SkeletonItems } from './components'

// Active = last section in document order whose top has passed this line
// relative to the scroll container's top edge.
const DETECTION_LINE = 100

export type NavigationBarItem = { id: string; label: string }

type NavigationBarProps = {
  items: NavigationBarItem[]
  loaded?: boolean
  embedded?: boolean
  containerId?: string
  barOffset: number
  slots?: {
    left: ({ sticky }: { sticky: boolean }) => React.ReactNode
    right: ({ sticky }: { sticky: boolean }) => React.ReactNode
  }
  stickyOffsets?: {
    left: number
    right: number
  }
}

export const NavigationBar = ({
  items,
  containerId,
  loaded = true,
  embedded = false,
  barOffset = 0,
  slots,
  stickyOffsets
}: NavigationBarProps) => {
  const clientSide = useClientSide()
  const { desktop } = useBreakpoints()
  const [activeIndex, setActiveIndex] = useState(-1)
  const [scrollTop, setScrollTop] = useState(0)
  const rafRef = useRef<number | null>(null)
  const idleTimerRef = useRef<number | null>(null)
  const clickLockedRef = useRef(false)
  const containerRef = useRef<HTMLElement | Window | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items

  const stickyLeft = scrollTop > (stickyOffsets?.left || barOffset)
  const stickyRight = scrollTop > (stickyOffsets?.right || barOffset)

  const runDetect = useCallback(() => {
    const container = containerRef.current
    const containerOffset =
      !container || container instanceof Window
        ? 0
        : container.getBoundingClientRect().top

    let next = -1
    itemsRef.current.forEach(({ id }, i) => {
      const el = document.getElementById(id)
      if (!el) return
      const { top, bottom } = el.getBoundingClientRect()
      if (top - containerOffset <= DETECTION_LINE && bottom >= 0) next = i
    })
    setActiveIndex((prev) => (next !== prev ? next : prev))
  }, [])

  const handleChange = (index: number) => {
    setActiveIndex(index)
    clickLockedRef.current = true
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }

  useEffect(() => {
    if (!clientSide || !desktop || !loaded) return

    const container =
      (containerId ? document.getElementById(containerId) : window) || window
    containerRef.current = container

    const getScrollTop = () =>
      container instanceof Window ? container.scrollY : container.scrollTop

    runDetect()
    setScrollTop(getScrollTop())

    const onScroll = () => {
      setScrollTop(getScrollTop())

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        if (!clickLockedRef.current) {
          runDetect()
          return
        }
        if (idleTimerRef.current !== null) clearTimeout(idleTimerRef.current)
        idleTimerRef.current = window.setTimeout(() => {
          clickLockedRef.current = false
          idleTimerRef.current = null
          runDetect()
        }, 150)
      })
    }

    container.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (idleTimerRef.current !== null) clearTimeout(idleTimerRef.current)
    }
  }, [clientSide, loaded, runDetect])

  return (
    <Box
      sx={{
        py: 1,
        px: 4,
        my: -1,
        mx: -4,
        zIndex: 'drawer',
        bgcolor: 'common.white',
        top: embedded ? '-8px' : 0,
        display: { xs: 'none', md: 'block' },
        position: { xs: 'relative', md: 'sticky' },
        transition: 'box-shadow 0.15s ease-in',
        ...(scrollTop > barOffset ? { boxShadow: 1 } : {})
      }}
    >
      <Box
        sx={{
          top: -8,
          left: 0,
          right: 0,
          height: 16,
          position: 'absolute',
          bgcolor: 'background.paper'
        }}
      />
      <Container sx={{ position: 'relative', minHeight: 44 }}>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Stack spacing={1} direction="row" sx={{ width: 148 }}>
            {slots?.left?.({ sticky: stickyLeft })}
          </Stack>

          {desktop && loaded ? (
            <NavigationItems
              items={items}
              active={activeIndex}
              onChange={handleChange}
              containerId={containerId}
            />
          ) : (
            <SkeletonItems />
          )}

          <Stack
            spacing={1}
            direction="row"
            justifyContent="flex-end"
            sx={{ width: 148 }}
          >
            {slots?.right?.({ sticky: stickyRight })}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
