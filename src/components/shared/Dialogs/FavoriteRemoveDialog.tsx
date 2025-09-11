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
import { useFavorites } from 'providers/FavoritesProvider'

import { BaseResponsiveDialog } from '.'

const dialogName = 'remove-favorite'

const FavoriteRemoveDialog = () => {
  const { visible, showDialog, hideDialog } = useDialog(dialogName)
  const { removing, removeId, remove, cancelRemove } = useFavorites()

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
      <DialogTitle>Remove property from favorites</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          Are you sure you want to remove this property from favorites?
          <br />
          After removal, you will not receive any updates about it.
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
            Remove
          </Button>
          <Button
            size="large"
            variant="outlined"
            disabled={removing}
            onClick={hideDialog}
          >
            Cancel
          </Button>
        </Stack>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}

export default FavoriteRemoveDialog
