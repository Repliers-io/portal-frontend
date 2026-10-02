import React from 'react'
import { useTranslations } from 'next-intl'

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

export const EstimateRemoveDialog = () => {
  const { hideDialog } = useDialog(dialogName)
  const { estimateToRemove, setEstimateToRemove, removeEstimate, loading } =
    useAgentEstimates()
  const { estimateId } = estimateToRemove || {}
  const { showSnackbar } = useSnackbar()
  const t = useTranslations('Dialogs')

  const handleHide = () => {
    setEstimateToRemove(null)
    hideDialog()
  }

  const handleRemove = async () => {
    if (!estimateId) return

    try {
      await removeEstimate(estimateId)
      handleHide()
      showSnackbar(t('RemoveEstimate.removedSuccess'), 'success')
    } catch (error) {
      console.error('Error removing estimate:', error)
      showSnackbar(t('RemoveEstimate.removedError'), 'error')
    }
  }

  return (
    <BaseResponsiveDialog name={dialogName} onClose={handleHide}>
      <DialogTitle>{t('RemoveEstimate.title')}</DialogTitle>
      <DialogContent>
        <Typography textAlign="center">
          {t('RemoveEstimate.confirm')}
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            onClick={handleRemove}
          >
            {t('Common.remove')}
          </Button>
          <Button
            size="large"
            variant="outlined"
            disabled={loading}
            onClick={handleHide}
          >
            {t('Common.cancel')}
          </Button>
        </Stack>
      </DialogActions>
    </BaseResponsiveDialog>
  )
}
