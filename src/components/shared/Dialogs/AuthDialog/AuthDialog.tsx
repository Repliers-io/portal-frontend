'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type React from 'react'

import routes from '@configs/routes'
import { authCallbackKey } from '@configs/storage'
import { storeRedirectUrl } from '@pages/login/utils'

import { useDialog } from 'providers/DialogProvider'

import { BaseResponsiveDialog } from '..'

import { AuthForm } from '.'

export const dialogName = 'auth'

const AuthDialog = () => {
  const { visible, hideDialog } = useDialog(dialogName)
  const router = useRouter()

  const handleAuthSuccess = useCallback(() => {
    hideDialog()
    const authCallbackUrl = localStorage.getItem(authCallbackKey)
    router.replace(authCallbackUrl || routes.home)
  }, [hideDialog, router])

  useEffect(() => {
    if (visible) storeRedirectUrl()
  }, [visible])

  return (
    <BaseResponsiveDialog name={dialogName} maxWidth={608}>
      <AuthForm embedded onSuccess={handleAuthSuccess} />
    </BaseResponsiveDialog>
  )
}

export default AuthDialog
