/**
 * Market dashboard landing: a "Market Insights" banner plus one CityAccordion per
 * `@configs/location` defaultCities. Per-city reports live in DashboardCityPageContent.
 * Anatomy: docs → product-guide/dashboard/technical.
 */
'use client'

import React, { useState } from 'react'

import { Box, Container } from '@mui/material'

import locationConfig from '@configs/location'
import { HeaderBanner } from '@templates/components/HeaderBanner'

import { CityAccordion } from './components'

type Props = {
  moreCities?: { name: string; activeCount: number }[]
}

const DashboardPageContent = (_props: Props) => {
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
      <HeaderBanner>Market Insights</HeaderBanner>
      <Box bgcolor="background.default">
        <Container
          disableGutters
          maxWidth="lg"
          sx={{ pt: { xs: 4, sm: 6, md: 8 }, mt: -1 }}
        >
          {locationConfig.defaultCities.map((city: string, index: number) => (
            <CityAccordion
              city={city}
              key={city}
              index={index}
              expanded={expanded === `accordion${index}`}
              onChange={handleAccordionChange(`accordion${index}`)}
            />
          ))}
        </Container>
      </Box>
    </Box>
  )
}

export default DashboardPageContent
