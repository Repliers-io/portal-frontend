import React from 'react'

import { IconButton } from '@mui/material'
const RoundButton = ({
  children,
  href,
  onClick,
  active = false,
  activeColor = 'secondary.main',
  normalColor = 'primary.main'
}: {
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
  href?: string | null
  active?: boolean
  activeColor?: string
  normalColor?: string
}) => {
  return (
    <span>
      <IconButton
        onClick={onClick}
        {...(href ? { href } : {})}
        sx={{
          width: 40,
          height: 40,
          boxShadow: 1,
          elevation: 3,
          bgcolor: 'background.default',
          color: active ? activeColor : normalColor,
          '&:hover': { color: activeColor, bgcolor: 'background.default' },
          transition:
            'opacity 0.2s linear, color 0.2s linear, background 0.2s linear'
        }}
      >
        {children}
      </IconButton>
    </span>
  )
}

export default RoundButton
