import React from 'react'

import { Box, Paper, Stack } from '@mui/material'

import { HomeView, StreetView } from '@shared/PropertyHomeView'

import { useEstimate } from 'providers/EstimateProvider'

import HouseDetailsContent from './HouseDetailsContent'

const EstimateCard = () => {
  const { loading, estimateData } = useEstimate()

  if (!estimateData || loading) return null

  return (
    <Paper>
      <Stack
        width="100%"
        direction="row"
        flexWrap={{ xs: 'wrap', md: 'nowrap' }}
      >
        <Box
          sx={{
            width: {
              xs: '100%',
              md: '50%'
            },
            flexGrow: {
              xs: 1,
              md: 0
            }
          }}
        >
          <HouseDetailsContent />
        </Box>
        <HomeView
          estimateData={estimateData}
          renderStreetView={({ estimateData }) => (
            <StreetView estimateData={estimateData} noLink />
          )}
        />
      </Stack>
    </Paper>
  )
}

export default EstimateCard
