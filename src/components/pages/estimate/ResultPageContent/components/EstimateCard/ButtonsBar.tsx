import { Button, Stack } from '@mui/material'

import IcoEdit from '@icons/IcoEdit'

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
        startIcon={<IcoEdit />}
      >
        Edit details
      </Button>
      <ShareEstimateButton color="secondary" />
    </Stack>
  )
}

export default ButtonsBar
