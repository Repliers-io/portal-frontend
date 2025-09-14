import React from 'react'

import { Box, Container } from '@mui/material'

import HeaderBanner from './components/HeaderBanner'
import { PageTemplate } from '.'

const StaticPageTemplate = ({
  title = '',
  children
}: {
  title?: string
  children: React.ReactNode
}) => {
  return (
    <PageTemplate>
      <HeaderBanner>{title}</HeaderBanner>
      <Box bgcolor="background.default">
        <Container
          sx={{
            py: { xs: 4, sm: 6, md: 8 },
            '& h3': { py: { xs: 4, sm: 6, md: 8 }, pb: { xs: 2, sm: 4 } }
          }}
        >
          {children}
        </Container>
      </Box>
    </PageTemplate>
  )
}

export default StaticPageTemplate
