'use client'

import { useCallback, useEffect } from 'react'
import React from 'react'

import routes from '@configs/routes'
import storageConfig from '@configs/storage'
import { storeRedirectUrl } from '@pages/login/utils'

import { useDialog } from 'providers/DialogProvider'

import { BaseResponsiveDialog } from '..'

import { AuthForm } from '.'

export const dialogName = 'auth'

const { authCallbackKey } = storageConfig

export const AuthDialog = () => {
  const { visible, hideDialog } = useDialog(dialogName)

  const handleAuthSuccess = useCallback(() => {
    hideDialog()
    const authCallbackUrl = localStorage.getItem(authCallbackKey)
    // Hard navigation (not router.replace) so the persistent UserProvider
    // re-reads the auth cookie on a fresh mount — client `logged` isn't reactive.
    window.location.replace(authCallbackUrl || routes.home)
  }, [hideDialog])

  useEffect(() => {
    if (visible) storeRedirectUrl()
  }, [visible])

  return (
    <BaseResponsiveDialog name={dialogName} maxWidth={608}>
      <AuthForm embedded onSuccess={handleAuthSuccess} />
    </BaseResponsiveDialog>
  )
}
