import React, { useState } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography
} from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { type PropertyClass } from '@configs/filters'
import { StatsGraph, StatsTabs } from '@shared/Stats'

type CityAccordionProps = {
  city: string
  index?: number
  expanded: boolean
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    expanded: boolean
  ) => void
}

const CityAccordion = ({
  city,
  index = 1,
  expanded,
  onChange
}: CityAccordionProps) => {
  const [propertyClass, setPropertyClass] =
    useState<PropertyClass>('residential')

  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      disableGutters
      sx={{
        p: 0,
        pb: 2,
        border: 0,
        boxShadow: 0,
        zIndex: index * 10,
        position: 'relative',
        bgcolor: 'common.white',

        '&::before': { display: 'none !important' },

        '&::after': {
          content: '""',
          left: 0,
          right: 0,
          top: 48,
          height: '1px',
          position: 'absolute',
          bgcolor: 'extraLight.main'
        },

        '& .MuiCollapse-root': { overflow: 'visible !important' },
        '& .MuiAccordionDetails-root': { opacity: expanded ? 1 : 0 }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon fontSize="large" />}
        sx={{
          p: 0,
          px: { xs: 2, md: 3 },
          mr: { xs: 0, md: '360px' },
          zIndex: 20,
          width: 'auto',
          position: 'relative',
          justifyContent: 'left',
          alignSelf: 'flex-start',
          bgcolor: 'common.white',
          '& .MuiAccordionSummary-content': { m: 0, flexGrow: 0 },
          '& .MuiAccordionSummary-expandIconWrapper': {
            px: 2,
            flexGrow: 0,
            fontSize: '2rem',
            color: 'primary.main'
          }
        }}
      >
        <Typography variant="h3" textAlign={{ xs: 'center', sm: 'left' }}>
          {city}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          p: 0,
          px: { xs: 2, md: 3 },
          pt: { xs: 2, md: 0 },
          mt: { xs: 0, md: -5 },
          zIndex: 10,
          position: 'relative',
          bgcolor: 'common.white',
          transition: { sm: 'opacity 0.2s linear' }
        }}
      >
        <Stack spacing={gridConfig.widgetSpacing}>
          <StatsTabs key={city} city={city} onTabChange={setPropertyClass} />
          <StatsGraph city={city} propertyClass={propertyClass} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default CityAccordion
