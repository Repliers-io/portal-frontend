'use client'

import React, { useEffect, useRef, useState } from 'react'
import queryString from 'query-string'

import routes from '@configs/routes'

import { Error40XView, LoadingView } from 'components/atoms'

import { useDialog } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import { AuthView, RedirectView } from '.'

type ClientSideGuardProps = {
  noHeader?: boolean
  loading?: boolean
  loginRequired?: boolean
  loginRedirect?: boolean
  roles?: string[]
  children: React.ReactNode
}

/**
 * Combined client-side guard component
 * Handles loading state, token authentication, login redirects, and role-based access
 * This component is always client-side while parent templates can remain server-side
 */
export const ClientSideGuard = ({
  noHeader = false,
  loading = false,
  loginRequired = false,
  loginRedirect = false,
  roles = ['user', 'agent', 'admin'],
  children
}: ClientSideGuardProps) => {
  const clientSide = useClientSide()
  const { showDialog } = useDialog('otp-auth')
  const { logged, role, loginWithToken } = useUser()

  // Capture the token once on mount — never re-read from window.location.search.
  // Reading live from the URL causes a race condition: loginWithToken removes the token
  // from the URL before the API call returns, so mid-flight re-renders (e.g. triggered
  // by setLoading) see token=null while logged=false → redirectNeeded fires prematurely.
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return (queryString.parse(window.location.search).token as string) || null
  })

  const allowed = roles.includes(role)
  const redirectTriggered = useRef(false)

  useEffect(() => {
    if (!token) return

    const processToken = async () => {
      try {
        await loginWithToken(token)
      } catch (error: unknown) {
        const status =
          error && typeof error === 'object' && 'status' in error
            ? (error as { status: number }).status
            : null
        console.error('[ClientSideGuard] token login failed', status)
        // result could be object | number | null
        // 412 - OTP required
        // 40X - Bad token
        if (status === 412) showDialog()
      } finally {
        // Only clear token state after processing is done — this prevents
        // the redirectNeeded check from firing before login completes.
        setToken(null)
      }
    }

    processToken()
  }, []) // run once on mount

  // Show loading if: not client-side yet, external loading prop, or processing token
  if (!clientSide || loading || Boolean(token))
    return <LoadingView noHeader={noHeader} />

  // At this point, we're on client-side, not processing token, and not in external loading state

  const redirectNeeded = loginRedirect && !logged && !token && clientSide

  // NOTE: react makes several rerenders before window.location.href will actually change
  if (redirectNeeded && !redirectTriggered.current) {
    redirectTriggered.current = true
    const currentRoute = window.location.pathname + window.location.search
    const params =
      routes.loginRedirect === currentRoute
        ? '' // do not add default redirect route to login url, as it will do this automatically
        : queryString.stringify({
            redirect: currentRoute
          })
    // cant use router.push because it is causing a loop
    window.location.href = `${routes.login}${params ? `?${params}` : ''}`
    // show nothing while redirecting
    return null
  }

  // Check if logged but not allowed role - show 403
  if (logged && !allowed) return <Error40XView errorCode={403} />

  // Render appropriate content based on auth state
  // Note: redirectNeeded might be true after redirect is triggered,
  // in that case we show RedirectView while waiting for page to change
  return redirectNeeded ? (
    <RedirectView />
  ) : logged || !loginRequired ? (
    children
  ) : (
    <AuthView />
  )
}
