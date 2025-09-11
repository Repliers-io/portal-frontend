'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type React from 'react'

import routes from '@configs/routes'
import { authCallbackKey } from '@configs/storage'
import { AuthForm } from '@shared/Dialogs/AuthDialog'

import { ClientLoginContainer, LoginSuccessContent } from './components'
import { storeRedirectUrl } from './utils'

const LoginPageContent = () => {
  const router = useRouter()

  const [success, setSuccess] = useState(false)

  const handleFormSuccess = () => {
    setSuccess(true)
    const authCallbackUrl = localStorage.getItem(authCallbackKey)
    router.replace(authCallbackUrl || routes.home)
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
