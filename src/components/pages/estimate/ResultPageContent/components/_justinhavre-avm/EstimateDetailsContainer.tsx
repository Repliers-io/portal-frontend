import React from 'react'

import { Box, Stack, Typography } from '@mui/material'

const DetailsContainer = ({
  title = '',
  children
}: {
  title?: string
  children: React.ReactNode
}) => {
  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      {title && (
        <Typography variant="h3" pb={4}>
          {title}
        </Typography>
      )}
      <Stack spacing={4} width="100%">
        {children}
      </Stack>
    </Box>
  )
}
export default DetailsContainer
