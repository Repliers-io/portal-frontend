import React from 'react'

import { Box, type SxProps, type Theme } from '@mui/material'

import { renderHtmlWithWidgets } from '../utils/renderHtmlWithWidgets'

type GhostRendererProps = {
  content: string
  sx?: SxProps<Theme>
}

/**
 * Renders Ghost CMS content (Mobiledoc or Lexical format) with widget support
 * TODO: Implement Ghost content transformation
 * - Parse Mobiledoc JSON format (Ghost v4 and earlier)
 * - Parse Lexical JSON format (Ghost v5+)
 * - Transform to HTML or React components
 * - Handle Ghost-specific cards (images, galleries, embeds, etc.)
 * Consider using @tryghost/mobiledoc-dom-renderer or custom Lexical parser
 */
export const GhostRenderer = ({ content, sx }: GhostRendererProps) => {
  const elements = renderHtmlWithWidgets(content)

  return <Box sx={sx}>{elements}</Box>
}
