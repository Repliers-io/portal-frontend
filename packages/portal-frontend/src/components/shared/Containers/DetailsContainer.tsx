import React, { type ReactNode } from 'react'

import { Box, lighten, Paper, type PaperProps, Typography } from '@mui/material'

import { primary } from '@configs/colors'

interface DetailsContainerProps extends PaperProps {
  id?: string
  title?: string
  subtitle?: ReactNode
  children: ReactNode
}

export const DetailsContainer: React.FC<DetailsContainerProps> = ({
  id,
  title,
  subtitle,
  children,
  ...rest
}) => {
  return (
    <Paper
      id={id}
      sx={{
        border: 1,
        boxShadow: 0,
        overflow: 'hidden',
        borderColor: 'divider'
      }}
      {...rest}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3, md: 4 },
            bgcolor: lighten(primary, 0.95)
          }}
        >
          <Typography variant="h4">{title}</Typography>
          {subtitle && (
            <Box sx={{ ml: 2, minWidth: 0, textAlign: 'right' }}>
              {subtitle}
            </Box>
          )}
        </Box>
      )}
      <Box
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          p: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {children}
      </Box>
    </Paper>
  )
}
