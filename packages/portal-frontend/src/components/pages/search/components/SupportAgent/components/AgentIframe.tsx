'use client'

import { forwardRef, useEffect, useState } from 'react'

import { Box } from '@mui/material'

import useIntersectionObserver from 'hooks/useIntersectionObserver'

import { NoiseLoader } from '.'

interface AgentIframeProps {
  src: string
}

export const AgentIframe = forwardRef<HTMLIFrameElement, AgentIframeProps>(
  ({ src }, ref) => {
    const [visible, setVisible] = useState(false)
    const [intersecting, intersectionRef] = useIntersectionObserver()

    useEffect(() => {
      if (intersecting && !visible) {
        const timer = setTimeout(() => setVisible(true), 1000)
        return () => clearTimeout(timer)
      }
    }, [intersecting, visible])

    return (
      <Box
        ref={intersectionRef}
        sx={{ position: 'relative', flex: 1, overflow: 'hidden' }}
      >
        {visible && (
          <iframe
            ref={ref}
            src={src}
            seamless
            scrolling="no"
            frameBorder="0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        )}

        <Box
          sx={{
            inset: 0,
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: visible ? 0 : 1,
            transition: 'opacity 0.5s linear',
            pointerEvents: !visible ? 'all' : 'none'
          }}
        >
          <NoiseLoader />
        </Box>
      </Box>
    )
  }
)

AgentIframe.displayName = 'AgentIframe'
