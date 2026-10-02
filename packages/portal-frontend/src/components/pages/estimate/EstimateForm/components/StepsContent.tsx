import React from 'react'

import { Box, CircularProgress } from '@mui/material'

import { useEstimate } from 'providers/EstimateProvider'
import { useEstimateSteps } from 'providers/EstimateStepsProvider'
import useClientSide from 'hooks/useClientSide'

const LoadingView = () => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <CircularProgress />
  </Box>
)

const StepsContent = () => {
  const { step } = useEstimate()
  const clientSide = useClientSide()
  const { stepComponents } = useEstimateSteps()

  return clientSide ? stepComponents[step] : <LoadingView />
}

export default StepsContent
