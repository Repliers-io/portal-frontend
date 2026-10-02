import React from 'react'

import { Box, Container, type SxProps, type Theme } from '@mui/material'

interface WidgetWrapperProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  bgcolor?: string
  sx?: SxProps<Theme>
  children: React.ReactNode
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  maxWidth = 'md',
  bgcolor = 'background.default',
  sx = {},
  children
}) => {
  return (
    <Box
      sx={{
        py: { xs: 4, sm: 4, md: 6 },
        width: '100vw',
        display: 'flex',
        position: 'relative',
        bgcolor,
        boxSizing: 'border-box',
        justifyContent: 'center',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        ...sx
      }}
    >
      {maxWidth === false ? (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {children}
        </Box>
      ) : (
        <Container maxWidth={maxWidth}>{children}</Container>
      )}
    </Box>
  )
}
