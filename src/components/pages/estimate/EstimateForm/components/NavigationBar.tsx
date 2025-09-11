'use client'

import AutoGraphIcon from '@mui/icons-material/AutoGraph'
import { Box, Button, Stack } from '@mui/material'

import IcoNext from '@icons/IcoNext'
import IcoPrev from '@icons/IcoPrev'

import { useEstimate } from 'providers/EstimateProvider'
import useClientSide from 'hooks/useClientSide'

const NavigationBar = () => {
  const clientSide = useClientSide()
  const { editing, loading, step, steps, nextStep, prevStep, estimateId } =
    useEstimate()

  const lastStep = step === steps - 1
  const freezeControls = loading || !clientSide

  const firstStepEditing = estimateId && step === 1
  const showPrevious = step > 0

  const buttonSx = {
    minHeight: 54,
    minWidth: { xs: 'auto', sm: 142 },
    width: {
      xs: '50%',
      sm: 'auto'
    }
  }

  return (
    <Stack spacing={2} direction="column" alignItems="center" width="100%">
      <Stack
        spacing={2}
        width="100%"
        direction="row"
        alignItems="center"
        justifyContent={{
          xs: 'flex-end',
          sm: step > 0 ? 'space-between' : 'center'
        }}
      >
        <Box
          flex={1}
          display={{
            xs: 'none',
            sm: 'flex'
          }}
        >
          {/* <ProgressBar current={step} steps={steps} /> */}
        </Box>

        {showPrevious ? (
          <Button
            size="large"
            variant="contained"
            onClick={prevStep}
            disabled={freezeControls}
            startIcon={freezeControls ? null : <IcoPrev />}
            sx={buttonSx}
          >
            {!freezeControls && (firstStepEditing ? 'Go back' : 'Previous')}
          </Button>
        ) : (
          <Box sx={{ ...buttonSx, mx: '1px' }} />
        )}

        <Button
          size="large"
          variant="contained"
          onClick={nextStep}
          loading={freezeControls}
          sx={buttonSx}
          endIcon={
            freezeControls ? null : lastStep ? <AutoGraphIcon /> : <IcoNext />
          }
        >
          {lastStep && clientSide ? (editing ? 'Update' : 'Calculate') : 'Next'}
        </Button>
      </Stack>
    </Stack>
  )
}

export default NavigationBar
