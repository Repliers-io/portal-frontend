import React from 'react'

import { Box, type SxProps, type Theme } from '@mui/material'

import { contentStyles } from '../styles'

import { renderHtmlWithWidgets } from '../utils/renderHtmlWithWidgets'

type GutenbergRendererProps = {
  content: string
  sx?: SxProps<Theme>
}

export const GutenbergRenderer = ({ content, sx }: GutenbergRendererProps) => {
  const elements = renderHtmlWithWidgets(content)

  return (
    <Box sx={[contentStyles, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      {elements}
    </Box>
  )
}
