import React from 'react'

import { Box, Container } from '@mui/material'

export const FooterContainer = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <Box
      sx={{
        px: 1,
        pt: 4,
        mt: 2,
        mb: -4,
        mx: -1,
        bgcolor: 'background.default'
      }}
    >
      <Container>{children}</Container>
    </Box>
  )
}
