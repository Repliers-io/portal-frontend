import type React from 'react'

import { Box, Container } from '@mui/material'

import { PropertyCarousel } from '@shared/Property'

import { type Property } from 'services/API'

const SimilarPropertyCarousel = ({
  properties
}: {
  properties: Property[]
}) => {
  if (properties.length === 0) return null

  return (
    <Box bgcolor="background.default" p={1} pt={4} mt={2} mb={-4} mx={-1}>
      <Container>
        <PropertyCarousel
          title="Similar properties"
          properties={properties}
          openInNewTab
        />
      </Container>
    </Box>
  )
}

export default SimilarPropertyCarousel
