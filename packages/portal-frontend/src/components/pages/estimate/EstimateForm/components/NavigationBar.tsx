'use client'

import { useTranslations } from 'next-intl'

import { Box, Button, Stack } from '@mui/material'

import estimateConfig from '@configs/estimate'
import { AutoGraphIcon, CloseIcon, NextIcon, PrevIcon } from '@configs/icons'

import { useEstimate } from 'providers/EstimateProvider'
import useClientSide from 'hooks/useClientSide'

const NavigationBar = () => {
  const t = useTranslations('Estimates.form')
  const clientSide = useClientSide()
  const {
    editing,
    loading,
    step,
    steps,
    nextStep,
    prevStep,
    estimateId,
    resetForm
  } = useEstimate()

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
          {estimateConfig.enableFormClose && (
            <Button
              size="large"
              variant="contained"
              color="secondary"
              onClick={resetForm}
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
          )}
        </Box>

        {showPrevious ? (
          <Button
            size="large"
            variant="contained"
            onClick={prevStep}
            disabled={freezeControls}
            startIcon={freezeControls ? null : <PrevIcon />}
            sx={buttonSx}
          >
            {!freezeControls &&
              (firstStepEditing
                ? t('navigation.goBack')
                : t('navigation.previous'))}
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
            freezeControls ? null : lastStep ? <AutoGraphIcon /> : <NextIcon />
          }
        >
          {lastStep && clientSide
            ? editing
              ? t('navigation.update')
              : t('navigation.calculate')
            : t('navigation.next')}
        </Button>
      </Stack>
    </Stack>
  )
}

export default NavigationBar
