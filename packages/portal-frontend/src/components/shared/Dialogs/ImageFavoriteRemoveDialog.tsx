'use client'

import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import { useImageFavorites } from 'providers/ImageFavoritesProvider'

import { BaseResponsiveDialog } from '.'

const dialogName = 'remove-image'

export const ImageFavoriteRemoveDialog = () => {
  const { visible, showDialog, hideDialog } = useDialog(dialogName)
  const { processing, removeId, removeImage, cancelRemove } =
    useImageFavorites()
  const t = useTranslations('Dialogs')

  const handleDelete = () => {
    if (!removeId) return
    removeImage(removeId)
  }

  useEffect(() => {
    if (removeId) showDialog()
  }, [removeId])

  useEffect(() => {
    // confirmation was canceled
    if (!visible && removeId) cancelRemove()
  }, [visible])

  useEffect(() => {
    // remove was successful
    if (!processing && !removeId) hideDialog()
  }, [processing, removeId])

  return (
    <BaseResponsiveDialog name={dialogName}>
      <DialogTitle>{t('RemoveImageFavorite.title')}</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          {t('RemoveImageFavorite.confirm')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="large"
            color="primary"
            variant="contained"
            loading={processing}
            disabled={processing}
            onClick={handleDelete}
          >
            {t('Common.remove')}
          </Button>
          <Button
            size="large"
            variant="outlined"
            disabled={processing}
            onClick={hideDialog}
          >
            {t('Common.cancel')}
          </Button>
        </Stack>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}
