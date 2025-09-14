import React from 'react'

import { Button } from '@mui/material'

import IcoShare from '@icons/IcoShare'

import { useEstimate, useEstimateUrl } from 'providers/EstimateProvider'
import useAnalytics from 'hooks/useAnalytics'
import useSnackbar from 'hooks/useSnackbar'

const ShareEstimateButton: React.FC<{
  color?: 'inherit' | 'primary' | 'secondary'
  sx?: object
}> = ({ color = 'primary', sx }) => {
  const trackEvent = useAnalytics()
  const { showSnackbar } = useSnackbar()
  const { estimateData } = useEstimate()
  const { estimateId, ulid } = estimateData || {}
  const { getEstimateUrl } = useEstimateUrl('route')

  const handleClick = async () => {
    trackEvent('share_estimate', { estimateId, ulid })
    const { origin } = window.location || {}
    const shareUrl = getEstimateUrl(ulid || estimateId)
    if (!shareUrl) {
      showSnackbar('Error sharing: Estimate not found', 'error')
      return
    }

    try {
      await navigator.clipboard.writeText(`${origin}${shareUrl}`)
      showSnackbar('Share link copied to clipboard!', 'success')
    } catch (error) {
      const { message } = error as Error
      console.error('[handleShareEstimate]:', error)
      showSnackbar(`Error sharing: ${message}`, 'error')
    }
  }

  return (
    <Button
      color={color}
      variant="outlined"
      startIcon={<IcoShare sx={{ fontSize: 14 }} />}
      onClick={handleClick}
      sx={sx}
    >
      Share Estimate
    </Button>
  )
}

export default ShareEstimateButton
