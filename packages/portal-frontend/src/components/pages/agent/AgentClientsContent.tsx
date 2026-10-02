'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Container, Stack, Typography } from '@mui/material'

import AgentClientsProvider from 'providers/AgentClientsProvider'

import { AgentClientsGrid } from './components'

const AgentClientsContent = () => {
  const t = useTranslations('Agent')

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
          <Typography variant="h3">{t('myClients')}</Typography>
          <AgentClientsGrid />
        </Stack>
      </Container>
    </AgentClientsProvider>
  )
}

export default AgentClientsContent
