import React from 'react'

import { Box, type SxProps, type Theme } from '@mui/material'

import { renderHtmlWithWidgets } from '../utils/renderHtmlWithWidgets'

type HtmlRendererProps = {
  content: string
  sx?: SxProps<Theme>
}

/**
 * Renders raw HTML content with typography styles and widget support
 * Parses [WidgetName param="value"] tags and replaces them with React components
 */
export const HtmlRenderer = ({ content, sx }: HtmlRendererProps) => {
  const elements = renderHtmlWithWidgets(content)

  return <Box sx={sx}>{elements}</Box>
}
