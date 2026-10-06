import React from 'react'

import { Stack, Typography } from '@mui/material'

export const MapTitleContent = ({
  title,
  icon,
  children
}: {
  title: React.ReactNode
  icon?: React.ReactNode
  children?: React.ReactNode
}) => {
  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      sx={{
        height: 40,
        minWidth: 0,
        overflow: 'hidden',
        typography: 'h6'
      }}
    >
      {icon}

      <Typography noWrap variant="inherit" sx={{ flexShrink: 0 }}>
        {title}
      </Typography>

      {children}
    </Stack>
  )
}
