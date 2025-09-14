'use client'

import React, { useState } from 'react'

import { Box, Container, Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'

import { CityAccordion } from './components'

const DashboardPageContent = () => {
  const [expanded, setExpanded] = useState<string | false>('accordion0')

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, newClick: boolean) => {
      // Option 1: wrap them all
      setExpanded(newClick ? panel : false)
      // Option 2: keep one accordion open at any time
      // if (newClick) setExpanded(panel);
    }

  return (
    <Box>
      <Container disableGutters maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={6}>
          <Typography variant="h1" textAlign="center">
            Market Insights
          </Typography>
          <Box>
            {defaultLocation.defaultCities.map(
              (city: string, index: number) => (
                <CityAccordion
                  city={city}
                  key={city}
                  index={index}
                  expanded={expanded === `accordion${index}`}
                  onChange={handleAccordionChange(`accordion${index}`)}
                />
              )
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default DashboardPageContent
