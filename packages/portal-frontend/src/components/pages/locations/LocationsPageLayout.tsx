import React from 'react'

import { Box, Container, Stack } from '@mui/material'

import { GridCenteringContainer } from '@shared/Containers'

export const LocationsPageLayout = ({
  header,
  filters,
  footer,
  content
}: {
  header: React.ReactNode
  filters: React.ReactNode
  footer: React.ReactNode
  content: React.ReactNode
}) => {
  return (
    <Stack spacing={4}>
      <Box sx={{ boxShadow: 1 }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 3 } }}>
          <Stack pb={{ xs: 1, sm: 1.5 }} spacing={{ xs: 1, sm: 1.5 }}>
            {header}

            {filters}
          </Stack>
        </Container>
      </Box>

      <GridCenteringContainer>{content}</GridCenteringContainer>

      <GridCenteringContainer maxWidth="lg">{footer}</GridCenteringContainer>
    </Stack>
  )
}
