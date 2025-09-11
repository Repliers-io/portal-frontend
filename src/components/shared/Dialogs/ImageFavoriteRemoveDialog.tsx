'use client'

import React, { useEffect } from 'react'

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

const ImageFavoriteRemoveDialog = () => {
  const { visible, showDialog, hideDialog } = useDialog(dialogName)
  const { processing, removeId, removeImage, cancelRemove } =
    useImageFavorites()

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
      <DialogTitle>Remove image from favorites</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          Are you sure you want to remove this image from favorites?
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
            Remove
          </Button>
          <Button
            size="large"
            variant="outlined"
            disabled={processing}
            onClick={hideDialog}
          >
            Cancel
          </Button>
        </Stack>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}

export default ImageFavoriteRemoveDialog
