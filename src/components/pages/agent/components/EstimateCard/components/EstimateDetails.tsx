'use client'

import React from 'react'

import { Box, Stack } from '@mui/material'

import { type EstimateData } from '@configs/estimate'
import { HomeView, StreetView } from '@shared/PropertyHomeView'
import EstimateDateDetails from '@shared/Widgets/EstimateDateDetails'
import EstimateWidget from '@shared/Widgets/EstimateWidget'

import { SalesIntentions } from '.'

const EstimateDetails = ({ estimateData }: { estimateData: EstimateData }) => {
  const { estimate, estimateHigh, estimateLow } = estimateData
  const { sellingTimeline } = estimateData.payload?.data?.salesIntentions || {}

  return (
    <Stack
      gap={3}
      display="grid"
      minHeight={232}
      gridTemplateColumns={{ xs: '1fr', md: '4fr 6fr' }}
      gridTemplateRows={{ xs: '260px 1fr', md: '1fr' }}
    >
      <Box position="relative">
        <HomeView
          sx={{ minHeight: 'auto', height: '100%', width: '100%' }}
          imageContainerSx={{ minHeight: '232px' }}
          estimateData={estimateData}
          renderStreetView={({ estimateData }) => (
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                minHeight: 'auto',
                height: '100%'
              }}
            >
              <StreetView estimateData={estimateData} size="420x232" />
            </Box>
          )}
        />
      </Box>
      <Box>
        <EstimateWidget
          size="medium"
          estimate={estimate}
          high={estimateHigh}
          low={estimateLow}
          title=""
        />

        <Stack mt={4} direction="column" gap={1}>
          <SalesIntentions sellingTimeline={sellingTimeline} />
          <EstimateDateDetails estimateData={estimateData} />
        </Stack>
      </Box>
    </Stack>
  )
}

export default EstimateDetails
