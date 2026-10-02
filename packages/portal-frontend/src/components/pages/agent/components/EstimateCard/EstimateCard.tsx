'use client'

import React from 'react'

import { Paper, Stack } from '@mui/material'

import { type EstimateData } from '@configs/estimate'
import { UpdateEmailNotification } from '@shared/Estimate'

import { ButtonsBar, EstimateDetails, HouseAddress } from './components'

const EstimateCard = ({ estimate }: { estimate: EstimateData }) => {
  return (
    <Paper
      sx={{
        p: 3,
        width: '100%',
        minHeight: { md: 392 },
        boxSizing: 'border-box'
      }}
    >
      <Stack spacing={3} flexGrow={1}>
        <HouseAddress estimateData={estimate} />
        <EstimateDetails estimateData={estimate} />

        <Stack
          spacing={1}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <UpdateEmailNotification estimateData={estimate} />

          <ButtonsBar estimateData={estimate} />
        </Stack>
      </Stack>
    </Paper>
  )
}

export default EstimateCard
