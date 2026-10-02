'use client'

import { useEffect, useState } from 'react'
import React from 'react'

import routes from '@configs/routes'
import storageConfig from '@configs/storage'
import { AuthForm } from '@shared/Dialogs/AuthDialog'

import { ClientLoginContainer, LoginSuccessContent } from './components'
import { storeRedirectUrl } from './utils'

const { authCallbackKey } = storageConfig

const LoginPageContent = () => {
  const [success, setSuccess] = useState(false)

  const handleFormSuccess = () => {
    setSuccess(true)
    const authCallbackUrl = localStorage.getItem(authCallbackKey)
    // Hard navigation (not router.replace) so the persistent UserProvider
    // re-reads the auth cookie on a fresh mount — client `logged` isn't reactive.
    window.location.replace(authCallbackUrl || routes.home)
  }

  useEffect(() => {
    storeRedirectUrl()
  }, [])

  return (
    <ClientLoginContainer>
      {success ? (
        <LoginSuccessContent />
      ) : (
        <AuthForm onSuccess={handleFormSuccess} />
      )}
    </ClientLoginContainer>
  )
}

export default LoginPageContent
