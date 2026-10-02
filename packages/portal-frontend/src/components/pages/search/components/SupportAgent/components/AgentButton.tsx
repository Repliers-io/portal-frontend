'use client'

import { useState } from 'react'

import { Box, Fab, keyframes, type SxProps } from '@mui/material'

import { CloseIcon } from '@configs/icons'

import useClientSide from 'hooks/useClientSide'

import { AgentAvatar } from '.'

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

interface AgentFabButtonProps {
  open: boolean
  sx?: SxProps
  onClick: () => void
}

export const AgentButton = ({ open, sx, onClick }: AgentFabButtonProps) => {
  const clientSide = useClientSide()
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    setAnimating(true)
    setTimeout(() => setAnimating(false), 300) // Match animation duration
    onClick()
  }

  const visible = clientSide

  return (
    <Fab
      color="primary"
      onClick={handleClick}
      sx={{
        display: 'flex',
        zIndex: 'tooltip',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease-in-out',
        transform: visible ? 'scale(1)' : 'scale(0)',
        animation: animating ? `${spinAnimation} 0.3s ease-in-out` : 'none',
        '&:hover': {
          transform: visible ? 'scale(1.1)' : 'scale(0)'
        },
        ...sx
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: open ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        >
          <AgentAvatar />
        </Box>
        <Box
          sx={{
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          <CloseIcon />
        </Box>
      </Box>
    </Fab>
  )
}
