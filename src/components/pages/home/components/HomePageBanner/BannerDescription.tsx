import React from 'react'

import { Box, Container, Typography } from '@mui/material'

const BannerDescription = ({
  title = '',
  subtitle = ''
}: {
  title?: string
  subtitle?: string
}) => {
  if (!title && !subtitle) return null

  return (
    <Container maxWidth="lg" sx={{ position: 'relative' }}>
      {title && (
        <Box
          sx={{
            py: { xs: 4, sm: 6, md: 8 },
            maxWidth: { xs: 'auto', md: '50%' }
          }}
        >
          <Typography
            variant="h1"
            color="common.white"
            sx={{
              textShadow: '0 0 10px rgba(0,0,0,0.3)',
              fontSize: { xs: '2rem', sm: '3rem' },
              lineHeight: 1.5
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      {subtitle && (
        <Box sx={{ maxWidth: { xs: 'auto', sm: '50%', md: '45%' } }}>
          <Typography
            variant="h4"
            color="common.white"
            sx={{
              p: 1,
              m: -1,
              borderRadius: 2,
              textShadow: {
                xs: '0 0 0px rgba(0,0,0,0.1)',
                sm: '0 0 2px rgba(0,0,0,0.3)'
              },
              bgcolor: {
                xs: 'rgba(0, 0, 0, 0.6)',
                sm: 'rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default BannerDescription
