import React from 'react'

import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import { useDialog } from 'providers/DialogProvider'
import useSnackbar from 'hooks/useSnackbar'

import { BaseResponsiveDialog } from '../index'

const dialogName = 'confirm-estimate-removal'

const EstimateRemoveDialog = () => {
  const { hideDialog } = useDialog(dialogName)
  const { estimateToRemove, setEstimateToRemove, removeEstimate, loading } =
    useAgentEstimates()
  const { estimateId } = estimateToRemove || {}
  const { showSnackbar } = useSnackbar()

  const handleHide = () => {
    setEstimateToRemove(null)
    hideDialog()
  }

  const handleRemove = async () => {
    if (!estimateId) return

    try {
      await removeEstimate(estimateId)
      handleHide()
      showSnackbar('Estimate removed successfully', 'success')
    } catch (error) {
      console.error('Error removing estimate:', error)
      showSnackbar('Error removing estimate', 'error')
    }
  }

  return (
    <BaseResponsiveDialog name={dialogName} onClose={handleHide}>
      <DialogTitle>Remove Estimate</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          Are you sure you want to remove this estimate?
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            onClick={handleRemove}
          >
            Remove
          </Button>
          <Button
            size="large"
            variant="outlined"
            disabled={loading}
            onClick={handleHide}
          >
            Cancel
          </Button>
        </Stack>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}

export default EstimateRemoveDialog
