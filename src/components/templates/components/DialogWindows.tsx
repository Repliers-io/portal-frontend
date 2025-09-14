'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import {
  AuthDialog,
  CookieDialog,
  FavoriteRemoveDialog,
  ImageFavoriteRemoveDialog,
  OtpAuthDialog,
  SaveSearchRemoveDialog
} from '@shared/Dialogs'

import { hasDialog, useDialogContext } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'

const DialogWindows = () => {
  const features = useFeatures()
  const params = useSearchParams()
  const { showDialogInstantly } = useDialogContext()
  const dialogName = params.get('dialog') || ''

  useEffect(() => {
    if (params && hasDialog(dialogName)) {
      showDialogInstantly(dialogName)
    }
  }, [])

  return (
    <>
      <AuthDialog />
      <OtpAuthDialog />
      {features.favorites && <FavoriteRemoveDialog />}
      {features.saveSearch && <SaveSearchRemoveDialog />}
      {features.imageFavorites && <ImageFavoriteRemoveDialog />}
      {features.cookieConsent && <CookieDialog />}
    </>
  )
}

export default DialogWindows
