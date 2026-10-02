import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

import { Box } from '@mui/material'

import { GridCenteringContainer } from '@shared/Containers'

import { useMapOptions } from 'providers/MapOptionsProvider'

import { DesktopContentShadow } from '.'

interface ScrollContainerProps {
  children: React.ReactNode
}

export const GridScrollContainer = forwardRef<
  HTMLElement,
  ScrollContainerProps
>(({ children }, ref) => {
  // local ref for the inner content box
  const innerRef = useRef<HTMLElement>(null)
  // expose innerRef.current to the outside via forwarded ref
  useImperativeHandle(ref, () => innerRef.current as HTMLElement)

  const [scrollY, setScrollY] = useState(0)
  const [scrollbarWidth, setScrollbarWidth] = useState(0)

  useLayoutEffect(() => {
    const outer = document.createElement('div')
    outer.style.cssText =
      'position:absolute;visibility:hidden;overflow:scroll;width:100px'
    document.body.appendChild(outer)
    const inner = document.createElement('div')
    outer.appendChild(inner)
    const width = outer.offsetWidth - inner.offsetWidth
    document.body.removeChild(outer)
    setScrollbarWidth(width)
  }, [])

  const { layout } = useMapOptions()
  const gridLayout = layout === 'grid'

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        display: 'flex',
        position: 'relative'
      }}
    >
      <DesktopContentShadow visible={scrollY > 0} />
      <Box
        ref={innerRef}
        onScroll={(e: any) => setScrollY(e.target.scrollTop)}
        sx={{
          pt: 1,
          width: '100%',
          height: '100%',
          position: 'absolute',
          scrollbarWidth: 'thin',
          boxSizing: 'border-box',
          overflowY: { xs: 'hidden', md: 'auto' },
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            flex: 1,
            mr: { xs: 0, md: scrollbarWidth ? `-${scrollbarWidth}px` : 0 }
          }}
        >
          <GridCenteringContainer gridLayout={gridLayout}>
            {children}
          </GridCenteringContainer>
        </Box>
      </Box>
    </Box>
  )
})
GridScrollContainer.displayName = 'GridScrollContainer'
