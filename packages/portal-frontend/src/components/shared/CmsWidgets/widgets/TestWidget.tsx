'use client'

import React from 'react'

import { Box, Chip, Stack, Typography } from '@mui/material'

export interface TestWidgetProps {
  title: string
  count: number
  enabled?: boolean
  tags?: string[]
  colors?: string[]
}

/**
 * Test widget to demonstrate widget system
 * Displays title, count, and optional tags/colors
 */
export const TestWidget = ({
  title,
  count,
  enabled = true,
  tags = [],
  colors = []
}: TestWidgetProps) => {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        border: 2,
        borderColor: enabled ? 'success.main' : 'grey.500',
        bgcolor: enabled ? 'success.light' : 'grey.300'
      }}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h5" sx={{ m: 0, p: 0 }}>
          {title}
        </Typography>

        <Typography>
          Count: <strong>{count}</strong>
        </Typography>

        <Typography>Status: {enabled ? '✓ Enabled' : '✗ Disabled'}</Typography>

        {tags.length > 0 && (
          <Box>
            <Typography>Tags:</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Box>
        )}

        {colors.length > 0 && (
          <Box>
            <Typography>Colors:</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {colors.map((color, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: color,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1
                  }}
                  title={color}
                />
              ))}
            </Box>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
