import { type ReactNode } from 'react'

import { Box, Typography } from '@mui/material'

import { aiBgColor, clientBgColor } from '../constants'
import { type ChatItem } from '../types'

const ChatBubble = ({
  type,
  children
}: {
  type: ChatItem['type']
  children: ReactNode | string
}) => {
  const aiBubble = type === 'ai'
  const bgcolor = aiBubble ? aiBgColor : clientBgColor
  return (
    <Box sx={{ overflow: 'hidden', px: 1 }}>
      <Box
        sx={{
          mx: 1,
          py: 1,
          px: 2,
          bgcolor,
          maxWidth: 250,
          borderRadius: 2,
          position: 'relative',
          display: 'inline-block',
          float: aiBubble ? 'left' : 'right',

          '&:after': {
            content: '""',
            width: 0,
            height: 0,
            bottom: 0,
            position: 'absolute',
            border: '8px solid transparent',
            borderBottomColor: bgcolor,
            ...(aiBubble ? { left: '-8px' } : { right: '-8px' })
          }
        }}
      >
        <Typography variant="body2" overflow="hidden">
          {children}
        </Typography>
      </Box>
    </Box>
  )
}

export default ChatBubble
