'use client'

import React, { useEffect, useState } from 'react'

import { Box, keyframes } from '@mui/material'

const floatUp = (rotate: boolean) => keyframes`
  0% {
    transform: translateY(400%) scale(0.5) rotate(${rotate ? '-359deg' : '0deg'});
    opacity: 0;
  }

  70% {
    transform: translateY(50%) scale(1) rotate(0deg);
    opacity: 1;
  }

  85% {
    transform: translateY(0) scale(1.5);
    opacity: 0.6;
  }

  100% {
    transform: translateY(-20%) scale(2.5);
    opacity: 0;
  }
`

export type FeedbackAnimationVariant = 'fixed' | 'absolute'

export interface FeedbackAnimationProps {
  icon: React.ReactNode
  iconColor?: string
  iconSize?: number
  rotate?: boolean
  trigger?: boolean
  duration?: number
  variant?: FeedbackAnimationVariant
  onComplete?: () => void
}

export const FeedbackAnimation = ({
  icon,
  iconColor,
  iconSize = 96,
  rotate = false,
  trigger = false,
  duration = 800,
  variant = 'fixed',
  onComplete
}: FeedbackAnimationProps) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [trigger, duration, onComplete])

  if (!show) return null

  return (
    <Box
      sx={{
        inset: 0,
        display: 'flex',
        zIndex: 'tooltip',
        position: variant,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          animation: `${floatUp(rotate)} ${duration}ms ease-out forwards`,
          '& svg': {
            width: `${iconSize}px !important`,
            height: `${iconSize}px !important`,
            ...(iconColor ? { fill: iconColor } : {})
          }
        }}
      >
        {icon}
      </Box>
    </Box>
  )
}
