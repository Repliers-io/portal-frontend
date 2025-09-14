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
          spacing={1.5}
          direction="row"
          justifyContent={{ xs: 'center', md: 'left' }}
        >
          {children}
          <Box
            sx={{
              pl: 1.5,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
          >
            {rightSlot}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default FiltersBar
