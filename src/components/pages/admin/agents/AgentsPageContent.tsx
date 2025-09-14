'use client'

import { Container, Stack } from '@mui/material'

import AgentsProvider from 'providers/AgentsProvider'

import { AgentsGrid } from './components'

const AgentsPageContent = () => {
  return (
    <AgentsProvider>
      <Container>
        <Stack direction="column" gap={3} py={{ xs: 2, sm: 4 }}>
          <AgentsGrid />
        </Stack>
      </Container>
    </AgentsProvider>
  )
}

export default AgentsPageContent
