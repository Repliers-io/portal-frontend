import React from 'react'

import { Box, Container, Stack } from '@mui/material'

const FiltersBar = ({
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
      <Container sx={{ position: 'relative' }}>
        <Stack
          spacing={1}
          direction="row"
          justifyContent={{ xs: 'center', md: 'left' }}
        >
          {children}
        </Stack>
      </Container>
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: { sm: 24, lg: 32 },
          display: { xs: 'none', md: 'flex' }
        }}
      >
        {rightSlot}
      </Box>
    </Box>
  )
}

export default FiltersBar
