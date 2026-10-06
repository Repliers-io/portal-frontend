'use client'

import { use, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

import { CircularProgress, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'
import storageConfig from '@configs/storage'
import { PageTemplate } from '@templates'

import { type RouteParamsProps } from 'app/types'

import { type AuthProvider } from 'services/API'
import { useUser } from 'providers/UserProvider'
import { capitalize } from 'utils/strings'

type AuthProcessingPageProps = RouteParamsProps<{
  provider: AuthProvider
}>

const { authCallbackKey } = storageConfig

const AuthPage = ({ params }: AuthProcessingPageProps) => {
  const { provider } = use(params)
  const searchParams = useSearchParams()
  const { login } = useUser()
  const exchanged = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    // the OAuth code is single-use, and StrictMode runs this effect twice in dev
    if (!code || exchanged.current) return
    exchanged.current = true

    login(provider, code)
      .then(() => {
        const authCallbackUrl = localStorage.getItem(authCallbackKey)
        // Hard navigation (not router.replace) so the persistent UserProvider
        // re-reads the auth cookie on a fresh mount — client `logged` isn't reactive.
        window.location.replace(authCallbackUrl || routes.home)
      })
      .catch((error) => console.error('[auth]', error))
  }, [provider, searchParams, login])

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
          <b style={{ fontWeight: 500 }}>{capitalize(provider)}</b> is in
          progress!
        </Typography>
      </Stack>
    </PageTemplate>
  )
}

export default AuthPage
