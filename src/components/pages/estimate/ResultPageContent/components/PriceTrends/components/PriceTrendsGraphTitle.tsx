import type React from 'react'

import { CircularProgress, Stack, Typography } from '@mui/material'

import { useEstimate } from 'providers/EstimateProvider'
import { formatFullAddress } from 'utils/properties'

const PriceTrendsGraphTitle = ({ loading = false }: { loading: boolean }) => {
  const { estimateData } = useEstimate()
  const { payload: { address } = { address: {} } } = estimateData || {}

  return (
    <Stack spacing={3} direction="row" alignItems="center">
      <Typography variant="body1">
        {address ? formatFullAddress(address) : 'Unknown address'}
      </Typography>
      {loading && <CircularProgress size={16} />}
    </Stack>
  )
}

export default PriceTrendsGraphTitle
