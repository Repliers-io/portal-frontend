'use client'

import React from 'react'

import { Box, Stack, type SxProps, type Theme, Typography } from '@mui/material'

import { type WidgetConfig } from '../types'

type WidgetPlaceholderProps = {
  widget: WidgetConfig
  sx?: SxProps<Theme>
}

/**
 * Component for rendering unknown/unregistered widgets
 * Shows widget name and all passed parameters for debugging
 */
export const UnknownWidget = ({ widget, sx }: WidgetPlaceholderProps) => {
  return (
    <Box
      className="repliers-widget"
      sx={{
        p: 2,
        border: 2,
        borderRadius: 1,
        borderColor: 'error.main',
        bgcolor: 'error.light',
        ...sx
      }}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" color="error.dark">
          Unknown Widget: {widget.name}
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1,
            border: 2,
            borderRadius: 1,
            color: 'grey.200',
            bgcolor: 'grey.500',
            borderColor: 'grey.600',
            fontSize: '0.75rem',
            overflow: 'auto'
          }}
        >
          {JSON.stringify(widget.props, null, 2)}
        </Box>
      </Stack>
    </Box>
  )
}
