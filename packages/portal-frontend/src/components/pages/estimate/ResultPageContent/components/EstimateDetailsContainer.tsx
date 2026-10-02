import React from 'react'

import { Divider, Stack, Typography } from '@mui/material'

const EstimateDetailsContainer = ({
  title = '',
  children
}: {
  title?: string
  children: React.ReactNode
}) => {
  return (
    <Stack sx={{ p: 3 }}>
      <Stack spacing={3} pb={3} width="100%">
        {title && <Typography variant="h3">{title}</Typography>}
        <Divider
          sx={{
            bgcolor: 'primary.main',
            height: 4,
            width: 96,
            borderRadius: 0.5,
            border: 0,
            m: 0
          }}
        />
      </Stack>
      <Stack spacing={4} width="100%" sx={{ flex: 1, height: '100%' }}>
        {children}
      </Stack>
    </Stack>
  )
}
export default EstimateDetailsContainer
