import React from 'react'

import { Box, type SxProps, type Theme } from '@mui/material'

type MdxRendererProps = {
  content: React.ComponentType
  sx?: SxProps<Theme>
}

/**
 * Renders MDX React components. String content gets the shared typography Box;
 * custom-layout pages pass no sx and are mounted directly, so the page's own
 * root sits under <main> with no inert wrapper to break the flex height chain.
 */
export const MdxRenderer = ({ content: Content, sx }: MdxRendererProps) => {
  if (!sx) return <Content />

  return (
    <Box sx={sx}>
      <Content />
    </Box>
  )
}
