'use client'

import React from 'react'

import { Box } from '@mui/material'

import { LoadingContent } from 'components/atoms'

import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import AuthView from './components/AuthView'
import DashboardHeader from './components/DashboardHeader'
import { PageTemplate } from '.'

const DashboardPageTemplate = ({ children }: { children: React.ReactNode }) => {
  const clientSide = useClientSide()
  const { logged, loading } = useUser()

  return (
    <PageTemplate>
      <Box minHeight="calc(100vh - 72px)">
        {clientSide && !logged && !loading ? (
          <AuthView />
        ) : (
          <>
            <DashboardHeader />
            <Box pt={4} pb={8}>
              {clientSide ? children : <LoadingContent />}
            </Box>
          </>
        )}
      </Box>
    </PageTemplate>
  )
}

export default DashboardPageTemplate
