'use client'

import React, { useEffect, useRef } from 'react'
import queryString from 'query-string'

import routes from '@configs/routes'

import { useDialog } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import AuthView from './components/AuthView'
import RedirectView from './components/RedirectView'
import { Page404Template, PageTemplate } from '.'

const ClientSidePageTemplate = ({
  noHeader = false,
  noFooter = false,
  loginRequired = false,
  loginRedirect = false, // alternative flow where we redirect the user to login page and then back to the original page
  roles = ['user', 'agent', 'admin'],
  loading: propsLoading,
  children,
  ...props
}: {
  noHeader?: boolean
  noFooter?: boolean
  loginRequired?: boolean
  loginRedirect?: boolean
  loading?: boolean
  roles?: string[]
  children: React.ReactNode
  [key: string]: any
}) => {
  const clientSide = useClientSide()
  const { showDialog } = useDialog('otp-auth')
  const { logged, role, loginWithToken } = useUser()
  const { token } = queryString.parse(
    typeof window !== 'undefined' ? window.location.search : ''
  )
  const allowed = roles.includes(role)

  const processToken = async (token: string) => {
    try {
      await loginWithToken(token)
    } catch (error: any) {
      console.error('[ClientSidePageTemplate] token login failed', error.status)
      // result could be object | number | null
      // 412 - OTP required
      // 40X - Bad token
      if (error?.status === 412) showDialog()
    }
  }

  useEffect(() => {
    if (token) processToken(String(token))
  }, [token])

  const redirectNeeded = loginRedirect && !logged && !token && clientSide
  const redirectTriggered = useRef(false)

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

  if (logged && clientSide && !allowed) {
    return <Page404Template errorCode={403} />
  }

  const loading = !clientSide || Boolean(token)

  return (
    <PageTemplate
      noHeader={noHeader}
      noFooter={noFooter}
      loading={loading || propsLoading}
      {...props}
    >
      {redirectNeeded ? (
        <RedirectView />
      ) : logged || !loginRequired ? (
        children
      ) : (
        <AuthView />
      )}
    </PageTemplate>
  )
}

export default ClientSidePageTemplate
