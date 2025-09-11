import React from 'react'

import { Box, Container, Stack, Typography } from '@mui/material'

const FullscreenView = ({
  title,
  subtitle,
  noHeader = false,
  children
}: {
  title?: string
  subtitle?: string
  noHeader?: boolean
  children?: React.ReactNode
}) => {
  // TODO: make Stack height dynamic to suit mobile appBar heights as well
  return (
    <Container maxWidth="lg">
      <Stack
        spacing={3}
        alignItems="center"
        justifyContent="center"
        sx={{
          py: 6,
          width: '100%',
          minHeight: noHeader ? '100vh' : 'calc(100vh - 72px)',
          boxSizing: 'border-box'
        }}
      >
        {title && (
          <Typography variant="h1" textAlign="center">
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="h3" textAlign="center">
            {subtitle}
          </Typography>
        )}
        <Box textAlign="center">{children}</Box>
      </Stack>
    </Container>
  )
}

export default FullscreenView
