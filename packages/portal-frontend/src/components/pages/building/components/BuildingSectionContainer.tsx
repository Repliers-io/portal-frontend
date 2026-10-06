import React from 'react'

import { Stack, Typography } from '@mui/material'

export const BuildingSectionContainer = ({
  id,
  title,
  children
}: {
  id?: string
  title?: string
  children?: React.ReactNode
}) => {
  return (
    <Stack
      id={id}
      spacing={4}
      sx={{
        pt: 4,
        mt: '4px',
        width: '100%',
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      {title && <Typography variant="h3">{title}</Typography>}

      {children}
    </Stack>
  )
}
