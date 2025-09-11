'use client'

import React from 'react'

import { Box, Container } from '@mui/material'

import { ProfileDialog } from '@shared/Dialogs'

import { DashboardMenu, DashboardProfile } from './components'

const DashboardHeader = () => {
  return (
    <Box sx={{ boxShadow: 1 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 3 }, pb: 1 }}>
        <DashboardProfile />
        <ProfileDialog />
      </Container>
      <Container maxWidth="lg" sx={{ pb: { sm: 1 } }}>
        <DashboardMenu />
      </Container>
    </Box>
  )
}

export default DashboardHeader
