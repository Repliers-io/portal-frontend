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
import { useFavorites } from 'providers/FavoritesProvider'

import { BaseResponsiveDialog } from '.'

const dialogName = 'remove-favorite'

export const FavoriteRemoveDialog = () => {
  const { visible, showDialog, hideDialog } = useDialog(dialogName)
  const { removing, removeId, remove, cancelRemove } = useFavorites()
  const t = useTranslations('Dialogs')

  const handleDelete = () => {
    if (!removeId) return
    remove(removeId)
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
    if (!removing && !removeId) hideDialog()
  }, [removing, removeId])

  return (
    <BaseResponsiveDialog name={dialogName}>
      <DialogTitle>{t('RemoveFavorite.title')}</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          {t('RemoveFavorite.confirm')}
          <br />
          {t('Common.updatesNotice')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="large"
            color="primary"
            variant="contained"
            loading={removing}
            disabled={removing}
            onClick={handleDelete}
          >
            {t('Common.remove')}
          </Button>
          <Button
            size="large"
            variant="outlined"
            disabled={removing}
            onClick={hideDialog}
          >
            {t('Common.cancel')}
          </Button>
        </Stack>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}
