import { useState } from 'react'

import { Box, Stack, Typography } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { type PropertyClass } from '@configs/filters'
import { StatsGraph, StatsTabs } from '@shared/Stats'

const CityDashboard = ({
  city,
  showChart = true
}: {
  city: string
  showChart?: boolean
}) => {
  const [propertyClass, setPropertyClass] =
    useState<PropertyClass>('residential')

  return (
    <Box>
      <Typography
        variant="h6"
        mb={{ xs: 4, sm: -4 }}
        textAlign={{ xs: 'center', sm: 'left' }}
      >
        My {city} Dashboard
      </Typography>
      <Stack spacing={gridConfig.widgetSpacing}>
        <StatsTabs city={city} onTabChange={setPropertyClass} />
        {showChart && <StatsGraph city={city} propertyClass={propertyClass} />}
      </Stack>
    </Box>
  )
}

export default CityDashboard
