import React from 'react'

import { ClientSideGuard } from './components'
import { PageTemplate } from '.'

export const ClientSidePageTemplate = ({
  noHeader = false,
  noFooter = false,
  loginRequired = false,
  loginRedirect = false, // alternative flow where we redirect the user to login page and then back to the original page
  roles = ['user', 'agent', 'admin'],
  loading,
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
} & Record<string, unknown>) => {
  return (
    <PageTemplate noHeader={noHeader} noFooter={noFooter} {...props}>
      <ClientSideGuard
        roles={roles}
        loading={loading}
        noHeader={noHeader}
        loginRequired={loginRequired}
        loginRedirect={loginRedirect}
      >
        {children}
      </ClientSideGuard>
    </PageTemplate>
  )
}
