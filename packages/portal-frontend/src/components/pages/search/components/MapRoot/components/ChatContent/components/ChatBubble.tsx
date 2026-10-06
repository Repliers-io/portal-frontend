'use client'

import { type ReactNode } from 'react'

import { Box, Stack, Typography } from '@mui/material'

import { aiBgColor, aiErrorBgColor, clientBgColor } from '../constants'
import { type ChatItem } from '../types'

export const ChatBubble = ({
  type,
  error,
  timestamp,
  children
}: {
  type: ChatItem['type']
  error?: boolean
  timestamp?: ChatItem['timestamp']
  children: ReactNode | string
}) => {
  const aiBubble = type === 'ai'
  const bgcolor = error ? aiErrorBgColor : aiBubble ? aiBgColor : clientBgColor
  return (
    <Box sx={{ overflow: 'hidden', px: 1 }}>
      <Stack direction={aiBubble ? 'row' : 'row-reverse'} alignItems="flex-end">
        <Box
          sx={{
            mx: 1,
            py: 1,
            px: 2,
            bgcolor,
            maxWidth: '75%',
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
          <Typography variant="body2" overflow="hidden" sx={{ my: '1px' }}>
            {children}
          </Typography>
        </Box>
        {timestamp && (
          <Typography color="text.hint" variant="caption" lineHeight="20px">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
