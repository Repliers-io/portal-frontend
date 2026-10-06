import React from 'react'

import { Box, Typography } from '@mui/material'

import { renderHtmlWithWidgets } from '../utils/renderHtmlWithWidgets'

interface MdxParagraphProps {
  children?: React.ReactNode
}

/**
 * Custom paragraph component for MDX that parses widget syntax
 * Handles both plain text and [WidgetName param="value"] syntax
 */
export const WidgetMdxParagraph = ({ children }: MdxParagraphProps) => {
  // Convert children to string to check for widget syntax
  const textContent =
    typeof children === 'string'
      ? children
      : React.Children.toArray(children)
          .map((child) => (typeof child === 'string' ? child : ''))
          .join('')

  // Check if content contains widget syntax
  const hasWidgetSyntax = /\[[\w]+[^\]]*\]/.test(textContent)

  // If has widget syntax, render parsed elements
  if (hasWidgetSyntax) {
    const elements = renderHtmlWithWidgets(textContent)

    return (
      <Box
        sx={{
          mb: 4,
          color: 'inherit',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          lineHeight: 'inherit'
        }}
      >
        {elements}
      </Box>
    )
  }

  // Otherwise, render normal paragraph.
  // Bottom margin only (no gutterBottom: the theme maps it to padding-bottom,
  // which would stack with the margin from contentStyles `& p`).
  return <Typography sx={{ mb: 2 }}>{children}</Typography>
}
