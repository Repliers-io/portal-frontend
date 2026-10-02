import React from 'react'

import { Box } from '@mui/material'

import { ClientSidePageTemplate } from './ClientSidePageTemplate'
import { DashboardHeader } from './components'

export const DashboardPageTemplate = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <ClientSidePageTemplate loginRequired>
      <Box minHeight="calc(100vh - 72px)">
        <DashboardHeader />
        <Box py={4}>{children}</Box>
      </Box>
    </ClientSidePageTemplate>
  )
}
