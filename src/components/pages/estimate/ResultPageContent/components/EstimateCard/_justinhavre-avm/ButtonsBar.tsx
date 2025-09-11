import { Button, Stack } from '@mui/material'

import IcoEdit from '@icons/IcoEdit'

import { useEstimate } from 'providers/EstimateProvider'

import ShareEstimateButton from '../ShareEstimateButton'

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
        color="primary"
        variant="outlined"
        onClick={() => showStep(1)}
        startIcon={<IcoEdit />}
        sx={{ px: 3 }}
      >
        Edit details
      </Button>
      <ShareEstimateButton color="primary" sx={{ px: 3 }} />
    </Stack>
  )
}

export default ButtonsBar
