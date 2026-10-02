'use client'

import { type ReactNode } from 'react'

import { Paper, Slide, Stack, type SxProps } from '@mui/material'

interface AgentChatContainerProps {
  open: boolean
  sx?: SxProps
  children: ReactNode
}

export const AgentChatContainer = ({
  open,
  sx,
  children
}: AgentChatContainerProps) => {
  return (
    <Slide direction="up" in={open}>
      <Paper
        elevation={3}
        sx={{
          p: 0.5,
          border: 2,
          display: 'flex',
          zIndex: 'tooltip',
          overflow: 'hidden',
          boxSizing: 'border-box',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderColor: 'secondary.main',
          ...sx
        }}
      >
        <Stack
          spacing={0.5}
          sx={{
            flexGrow: 1,
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          {children}
        </Stack>
      </Paper>
    </Slide>
  )
}
