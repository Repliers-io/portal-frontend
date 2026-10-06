import React, { useEffect, useRef, useState } from 'react'

import { Box, Container, Stack } from '@mui/material'

import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

import { NavigationItems, SkeletonItems } from './components'
import { useSectionNav } from './useSectionNav'

// a section lands 32px under the bar
const sectionGap = 32

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
  const [scrollTop, setScrollTop] = useState(0)
  const barRef = useRef<HTMLDivElement | null>(null)

  // the listing browser dialog's scroller when the bar sits in it; the window otherwise
  const root =
    clientSide && containerId ? document.getElementById(containerId) : null

  const { available, active, onSelect } = useSectionNav({
    sections: items,
    root,
    barRef,
    gap: sectionGap,
    enabled: loaded
  })

  const stickyLeft = scrollTop > (stickyOffsets?.left || barOffset)
  const stickyRight = scrollTop > (stickyOffsets?.right || barOffset)

  useEffect(() => {
    const getScrollTop = () => (root ? root.scrollTop : window.scrollY)
    const onScroll = () => setScrollTop(getScrollTop())
    const container: HTMLElement | Window = root ?? window

    onScroll()
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [root])

  return (
    <Box
      ref={barRef}
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
              items={available}
              active={active}
              onSelect={onSelect}
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
