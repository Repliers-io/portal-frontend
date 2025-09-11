import React from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Button, Stack } from '@mui/material'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'

import { EstimatesBreadcrumbs } from '.'

const DetailsTopBar = () => {
  const { loading, client, getEstimateUrl } = useAgentEstimates()

  const estimateLink = getEstimateUrl()

  const disabled = !client || loading

  return (
    <Stack
      spacing={{ xs: 1, md: 3 }}
      direction="row"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="space-between"
    >
      <EstimatesBreadcrumbs />

      <Button
        color="primary"
        variant="contained"
        disabled={disabled}
        startIcon={<AddIcon />}
        href={estimateLink}
      >
        Estimate
      </Button>
    </Stack>
  )
}

export default DetailsTopBar
