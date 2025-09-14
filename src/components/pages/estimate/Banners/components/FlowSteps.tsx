import React from 'react'

import { Stack, Typography } from '@mui/material'

import {
  IcoCalendar,
  IcoCircleStar,
  IcoCube,
  IcoFiles,
  IcoHouse,
  IcoKey,
  IcoLocation,
  IcoRenovations
} from '@icons/index'

interface Step {
  icon: React.ReactNode
  title: string
  text: string
}

const Steps: Step[] = [
  {
    icon: <IcoFiles />,
    title: 'Property Tax',
    text: 'A key benchmark. Tax assessments help ground your estimate in real, municipality-backed data.'
  },
  {
    icon: <IcoLocation />,
    title: 'Location & Neighborhood',
    text: 'Local market trends and recent nearby sales are major drivers of home value.'
  },
  {
    icon: <IcoHouse />,
    title: 'Property Type & Size',
    text: "Whether it’s a condo or a detached home, the size of your home is a key factor to determine your home's value."
  },
  {
    icon: <IcoCube />,
    title: 'Lot Size & Features',
    text: 'Bigger lots and unique shapes like corner or pie lots often increase desirability.'
  },
  {
    icon: <IcoCalendar />,
    title: 'Age & Condition',
    text: 'Newer and well-maintained homes tend to hold more value over time.'
  },
  {
    icon: <IcoRenovations />,
    title: 'Upgrades & Extras',
    text: 'Renovations, modern finishes, finished basements, and upgraded appliances can significantly increase your home’s worth.'
  },
  {
    icon: <IcoKey />,
    title: 'Maintenance Fees',
    text: 'Lower monthly fees can make units more attractive and increase resale value.'
  },
  {
    icon: <IcoCircleStar />,
    title: 'Exposure & Amenities',
    text: 'A bright southern view and top-tier amenities like gyms or pools boost appeal.'
  }
]

const StepsItem: React.FC<Step> = ({ icon, title, text }) => {
  return (
    <Stack
      spacing={2.5}
      // top divider line, visible on medium screens and up
      py={{ xs: 2, md: 2.5 }}
      borderTop={{ xs: 0, md: 1 }}
      borderColor={{ xs: 'transparent', md: 'divider' }}
      // left divider line, visible on medium screens and up
      position="relative"
      px={{ xs: 2, md: 3.5 }}
      sx={{
        '&:before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '1px',
          height: '100px',
          backgroundColor: 'divider',
          display: { xs: 'none', md: 'block' } // hide on small screens
        }
      }}
    >
      {icon}
      <Stack spacing={0.5}>
        <Typography variant="h4" color="common.white">
          {title}
        </Typography>
        <Typography variant="body2" color="common.white">
          {text}
        </Typography>
      </Stack>
    </Stack>
  )
}

const FlowSteps = () => {
  return (
    <Stack
      position="relative"
      py={{ xs: 3, md: 3.5 }}
      px={{ xs: 3, md: 6 }}
      spacing={{ xs: 3, md: 4 }}
    >
      <Typography variant="h2" color="common.white">
        How Do We Estimate Your Home’s Value?
      </Typography>

      <Stack
        overflow="hidden" // for trim divider lines
      >
        <Stack
          position="relative"
          display="grid"
          gridTemplateColumns={{
            // Control items per row at each breakpoint for divider consistency, each line must contain a pair of items
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          }}
          // adjust negative margins for trim divider lines
          mt={{ xs: -2, md: -2.5 }}
          mx={{ xs: -2, md: -3.5 }}
        >
          {Steps.map(({ icon, title, text }) => (
            <StepsItem icon={icon} title={title} text={text} key={title} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default FlowSteps
