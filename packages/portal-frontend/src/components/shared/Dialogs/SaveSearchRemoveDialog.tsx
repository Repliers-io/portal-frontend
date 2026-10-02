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
import { useSaveSearch } from 'providers/SaveSearchProvider'

import { BaseResponsiveDialog } from '.'

const dialogName = 'delete-saved-search'

export const SaveSearchRemoveDialog = () => {
  const { visible, showDialog, hideDialog } = useDialog(dialogName)
  const { deleteId, deleteSearch, cancelDelete, processing } = useSaveSearch()
  const t = useTranslations('Dialogs')

  const handleDelete = () => {
    if (!deleteId) return
    deleteSearch(deleteId)
  }

  useEffect(() => {
    if (deleteId) showDialog()
  }, [deleteId])

  useEffect(() => {
    // confirmation was canceled
    if (!visible && deleteId) cancelDelete()
  }, [visible])

  useEffect(() => {
    // delete was successful
    if (!processing && !deleteId) hideDialog()
  }, [processing, deleteId])

  return (
    <BaseResponsiveDialog name={dialogName}>
      <DialogTitle>{t('DeleteSavedSearch.title')}</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          {t('DeleteSavedSearch.confirm')}
          <br />
          {t('DeleteSavedSearch.notice')}
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
            {t('Common.delete')}
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
