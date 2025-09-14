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
import { useSaveSearch } from 'providers/SaveSearchProvider'

import { BaseResponsiveDialog } from '.'

const dialogName = 'delete-saved-search'

const SaveSearchRemoveDialog = () => {
  const { visible, showDialog, hideDialog } = useDialog(dialogName)
  const { deleteId, deleteSearch, cancelDelete, processing } = useSaveSearch()

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
      <DialogTitle>Delete saved search</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          Are you sure you want to delete this saved search?
          <br />
          After deletion, you will not receive any updates about it.
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
            Delete
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

export default SaveSearchRemoveDialog
