'use client'

import type React from 'react'

import { Container, Stack, Typography } from '@mui/material'

import AgentClientsProvider from 'providers/AgentClientsProvider'

import { AgentClientsGrid } from './components'

const AgentClientsContent = () => {
  return (
    <AgentClientsProvider>
      <Container>
        <Stack
          direction="column"
          gap={3}
          py={{
            xs: 2,
            sm: 4
          }}
        >
          <Typography variant="h3">My Clients</Typography>
          <AgentClientsGrid />
        </Stack>
      </Container>
    </AgentClientsProvider>
  )
}

export default AgentClientsContent
