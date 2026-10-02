'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Badge } from '@mui/material'

export const ToolbarMenuItemBadge = ({
  count,
  flashing = false,
  inline = false,
  color = 'secondary',
  children
}: {
  count?: number
  flashing?: boolean
  inline?: boolean
  color?: 'primary' | 'secondary'
  children?: React.ReactNode
}) => {
  const previousCount = useRef(count)
  const settled = useRef(false)
  const [transitionState, setTransitionState] = useState(!flashing)

  useEffect(() => {
    let timer: any
    if (count !== previousCount.current) {
      // First count change after mount is the initial async data load
      // (lists hydrate 0 -> N), not a user action — don't flash then.
      if (settled.current) {
        setTransitionState(true)
        timer = setTimeout(() => {
          setTransitionState(false)
        }, 100)
      } else {
        settled.current = true
      }
      previousCount.current = count
    }
    return () => clearTimeout(timer)
  }, [count])

  return (
    <Badge
      color={color}
      badgeContent={count}
      sx={{
        '& .MuiBadge-badge': {
          fontSize: 12,

          borderRadius: 4,
          animation: 'none',
          transition: 'none',
          ...(inline
            ? {
                transform: 'none',
                position: 'static',
                minWidth: 20,
                minHeight: 20
              }
            : {
                top: '6px',
                right: '8px',
                minWidth: 24,
                minHeight: 24,
                border: '2px solid #FFF'
              }),
          ...(flashing
            ? {
                transitionProperty: 'background-color, color',
                transitionTimingFunction: 'ease, ease-in',
                transitionDuration: transitionState ? '0.1s, 0.1s' : '1s, 2s',
                color: transitionState ? 'common.white' : 'text.hint',
                bgcolor: transitionState
                  ? `${color}.main`
                  : 'background.default'
              }
            : {
                color: 'common.white',
                bgcolor: `${color}.main`
              })
        }
      }}
    >
      {children}
    </Badge>
  )
}
