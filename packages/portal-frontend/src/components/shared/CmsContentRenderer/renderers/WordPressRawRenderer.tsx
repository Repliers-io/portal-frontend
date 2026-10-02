import React from 'react'

import { Box, type SxProps, type Theme } from '@mui/material'

import { renderHtmlWithWidgets } from '../utils/renderHtmlWithWidgets'

type WordPressRawRendererProps = {
  content: string
  sx?: SxProps<Theme>
}

/**
 * Renders raw WordPress content (Gutenberg blocks stripped of block comments).
 * Does NOT apply autop — raw content already contains proper HTML structure
 * including explicit <br> tags, paragraphs, etc. autop would corrupt them.
 */
export const WordPressRawRenderer = ({
  content,
  sx
}: WordPressRawRendererProps) => {
  // Strip Gutenberg block delimiter comments only — preserve all HTML as-is
  const stripped = content.replace(/<!--\s*\/?wp:[^>]*-->/g, '')
  const elements = renderHtmlWithWidgets(stripped)

  return <Box sx={sx}>{elements}</Box>
}
