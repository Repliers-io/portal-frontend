import type React from 'react'

import { Container, Stack, Typography } from '@mui/material'

const EmptyTemplate = ({
  icon,
  title,
  children
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack spacing={2} alignItems="center">
        {icon}
        <Typography variant="h4" textAlign="center">
          {title}
        </Typography>
        <Typography color="text.hint" textAlign="center">
          {children}
        </Typography>
      </Stack>
    </Container>
  )
}

export default EmptyTemplate
