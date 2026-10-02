import React from 'react'

import { Box, type SxProps, type Theme, Typography } from '@mui/material'

type FieldWrapperProps = {
  label?: string
  required?: boolean
  containerSx?: SxProps<Theme>
  children: React.ReactNode
}

export const FieldWrapper = ({
  label,
  required,
  containerSx,
  children
}: FieldWrapperProps) => {
  if (!label && !containerSx) return <>{children}</>

  return (
    <Box sx={containerSx}>
      {label && (
        <Typography
          component="label"
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            minHeight: 24,
            mb: 0.5,
            color: 'text.hint'
          }}
        >
          {label}
          {required && (
            <Typography component="span" color="error.main">
              *
            </Typography>
          )}
        </Typography>
      )}
      {children}
    </Box>
  )
}
