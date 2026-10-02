import { Button, Stack } from '@mui/material'

import { EstimateEditIcon } from '@configs/icons'

import { useEstimate } from 'providers/EstimateProvider'

import ShareEstimateButton from './ShareEstimateButton'

const ButtonsBar = () => {
  const { showStep } = useEstimate()

  return (
    <Stack
      direction={{
        xs: 'column',
        sm: 'row'
      }}
      spacing={{ xs: 2, sm: 3 }}
    >
      <Button
        color="secondary"
        variant="outlined"
        onClick={() => showStep(1)}
        startIcon={<EstimateEditIcon />}
      >
        Edit details
      </Button>
      <ShareEstimateButton color="secondary" />
    </Stack>
  )
}

export default ButtonsBar
