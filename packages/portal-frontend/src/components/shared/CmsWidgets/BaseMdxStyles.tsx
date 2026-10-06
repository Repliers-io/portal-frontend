import React, { type ReactNode } from 'react'

import { Box, type BoxProps } from '@mui/material'

interface BaseMdxStylesProps extends BoxProps {
  children: ReactNode
}

/**
 * Base styles for MDX content.
 * Sets typography defaults (subtitle2) and resets MUI List to native HTML.
 * Uses 'repliers-widget' class which is excluded from CMS content styling.
 */
export const BaseMdxStyles: React.FC<BaseMdxStylesProps> = ({
  children,
  sx,
  ...rest
}) => (
  <Box
    className="repliers-widget"
    sx={{
      // TODO: review this approach, temporary override MDX typography for avoid global affection on other application parts

      // Customize typography for MDX content
      '& p:not(.MuiFormHelperText-root)': {
        typography: 'subtitle2',
        pb: 0,
        mb: 2
      },
      '& p:not(.MuiFormHelperText-root):last-child': { mb: 0 },

      // Reset MUI List styles to native HTML list
      '& .MuiList-root': {
        p: 0,
        pl: 2.5,
        mb: 2,
        listStyle: 'disc',
        color: 'text.primary'
      },
      '& .MuiListItem-root': {
        display: 'list-item',
        p: 0,
        mb: 0.5
      },
      '& .MuiListItemIcon-root': {
        display: 'none'
      },
      '& .MuiListItemText-root': {
        m: 0
      },
      ...sx
    }}
    {...rest}
  >
    {children}
  </Box>
)
