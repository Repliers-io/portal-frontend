import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'

import useBreakpoints from 'hooks/useBreakpoints'

// TODO: gridColumnsMediaQueries should be moved out of MapRoot
import { gridColumnsMediaQueries } from '../../../constants'

import DesktopContentShadow from './DesktopContentShadow'

interface ScrollContainerProps {
  children: React.ReactNode
}
const { gridSpacing } = gridConfig

const GridScrollContainer = forwardRef<HTMLElement, ScrollContainerProps>(
  ({ children }, ref) => {
    // local ref for the inner content box
    const innerRef = useRef<HTMLElement>(null)
    // expose innerRef.current to the outside via forwarded ref
    useImperativeHandle(ref, () => innerRef.current as HTMLElement)

    const [scrollY, setScrollY] = useState(0)
    const { mobile, tablet } = useBreakpoints()

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
            width: '100%',
            height: '100%',
            position: 'absolute',
            scrollbarWidth: 'thin',
            overflowY: { xs: 'hidden', md: 'auto' },
            overflowX: 'hidden'
          }}
        >
          <Box
            sx={{
              // hack to show content (+paddings) on top of the scrollbar
              // and do not take it into account when calculating the width
              // (windows platform only)
              contentVisibility: 'visible',
              mx: 'auto',
              height: '100%',
              position: 'relative',
              ...(!mobile && !tablet ? gridColumnsMediaQueries : {})
            }}
          >
            <Box
              sx={{
                pt: 1,
                pb: gridSpacing,
                px: { xs: 0, md: gridSpacing }
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }
)
GridScrollContainer.displayName = 'GridScrollContainer'

export default GridScrollContainer
