'use client'

import { useEffect } from 'react'

import { DialogTitle } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import { useSaveSearch } from 'providers/SaveSearchProvider'

import { BaseResponsiveDialog } from '..'

import SaveSearchForm from './SaveSearchForm'

const dialogName = 'save-search'

const SaveSearchDialog = () => {
  const { visible, showDialog, hideDialog } = useDialog(dialogName)
  const { editId, cancelEdit } = useSaveSearch()

  const handleCancel = () => {
    hideDialog()
  }

  useEffect(() => {
    if (editId) showDialog()
  }, [editId])

  useEffect(() => {
    // edit was canceled
    if (!visible && editId) cancelEdit()
  }, [visible])

  return (
    <BaseResponsiveDialog name={dialogName}>
      <DialogTitle>{editId ? 'Edit Search' : 'Save Search'}</DialogTitle>

      <SaveSearchForm onSubmit={handleCancel} onCancel={handleCancel} />
    </BaseResponsiveDialog>
  )
}

export default SaveSearchDialog
