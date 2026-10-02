import React from 'react'

import { Box, Container, Stack } from '@mui/material'

export const MapFiltersBar = ({
  rightSlot,
  children
}: {
  rightSlot?: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        zIndex: 'appBar',
        py: { xs: 1, sm: 1.5 },
        position: 'relative'
      }}
    >
      <Container sx={{ position: 'relative', px: { xs: 1, sm: 2, md: 3 } }}>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            spacing={1}
            width="100%"
            direction="row"
            justifyContent={{ xs: 'center', md: 'left' }}
            pr={0.5}
          >
            {children}
          </Stack>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, pr: '1px' }}>
            {rightSlot}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
