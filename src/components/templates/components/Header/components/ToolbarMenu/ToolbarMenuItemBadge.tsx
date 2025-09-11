import React, { useEffect, useRef, useState } from 'react'

import { Badge } from '@mui/material'

const ToolbarMenuItemBadge = ({
  count,
  flashing = false,
  color = 'secondary',
  children
}: {
  count: number
  flashing?: boolean
  color?: 'primary' | 'secondary'
  children: React.ReactNode
}) => {
  const previousCount = useRef(count)
  const [transitionState, setTransitionState] = useState(!flashing)

  useEffect(() => {
    let timer: any
    if (previousCount.current && count !== previousCount.current) {
      setTransitionState(true)
      timer = setTimeout(() => {
        setTransitionState(false)
      }, 100)
    }
    previousCount.current = count
    return () => clearTimeout(timer)
  }, [count])

  return (
    <Badge
      color={color}
      badgeContent={count}
      sx={{
        '& .MuiBadge-badge': {
          top: '6px',
          right: '8px',
          fontSize: 12,
          minWidth: 24,
          minHeight: 24,
          borderRadius: 4,
          border: '2px solid #FFF',
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

export default ToolbarMenuItemBadge
