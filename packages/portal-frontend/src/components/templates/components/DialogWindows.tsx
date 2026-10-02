'use client'

import { useEffect } from 'react'

import features from '@configs/features'
import {
  AuthDialog,
  ContactUsDialog,
  CookieDialog,
  FavoriteRemoveDialog,
  ImageFavoriteRemoveDialog,
  OtpAuthDialog,
  ParcelDialog,
  SaveSearchRemoveDialog
} from '@shared/Dialogs'

import { hasDialog, useDialogContext } from 'providers/DialogProvider'

const DialogWindows = () => {
  const { showDialogInstantly } = useDialogContext()

  // Read the ?dialog= deep-link on the client only. Calling useSearchParams() at
  // render time forces an SSR bailout that renders this subtree outside the client
  // providers, throwing "useDialogContext must be used within a DialogProvider".
  useEffect(() => {
    const dialogName =
      new URLSearchParams(window.location.search).get('dialog') || ''
    if (hasDialog(dialogName)) {
      showDialogInstantly(dialogName)
    }
  }, [])

  return (
    <>
      <AuthDialog />
      <OtpAuthDialog />
      <ContactUsDialog />
      {features.favorites && <FavoriteRemoveDialog />}
      {features.saveSearch && <SaveSearchRemoveDialog />}
      {features.imageFavorites && <ImageFavoriteRemoveDialog />}
      {features.cookieConsent && <CookieDialog />}
      {features.publicRecord && <ParcelDialog />}
    </>
  )
}

export default DialogWindows
