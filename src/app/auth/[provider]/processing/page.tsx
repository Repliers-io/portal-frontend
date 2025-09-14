'use client'

import React, { use, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { CircularProgress, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'
import storageConfig from '@configs/storage'
import { PageTemplate } from '@templates'

import { type AuthProvider } from 'services/API'
import { useUser } from 'providers/UserProvider'
import { capitalize } from 'utils/strings'

type AuthProcessingPageProps = {
  params: Promise<{
    provider: AuthProvider
  }>
}

const { authCallbackKey } = storageConfig

const AuthPage = (props: AuthProcessingPageProps) => {
  const params = use(props.params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useUser()

  const handleAuth = async () => {
    const code = searchParams.get('code')
    if (typeof window === 'undefined' || !code) return

    try {
      await login(params.provider, code)
      const authCallbackUrl = localStorage.getItem(authCallbackKey)
      router.replace(authCallbackUrl || routes.home)
    } catch (error) {
      console.error('[auth]', error)
    }
  }

  useEffect(() => {
    handleAuth()
  }, [])

  return (
    <PageTemplate noHeader noFooter>
      <Stack
        sx={{ height: '100vh' }}
        alignItems="center"
        justifyContent="center"
        spacing={2}
      >
        <CircularProgress />
        <Typography>
          Authentication using{' '}
          <b style={{ fontWeight: 500 }}>{capitalize(params.provider)}</b> is in
          progress!
        </Typography>
      </Stack>
    </PageTemplate>
  )
}

export default AuthPage
