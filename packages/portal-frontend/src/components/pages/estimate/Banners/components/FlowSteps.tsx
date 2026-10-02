import React from 'react'
import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import {
  CalendarIcon,
  CircleStarIcon,
  CubeIcon,
  FilesIcon,
  HouseIcon,
  KeyIcon,
  LocationIcon,
  RenovationsIcon
} from '@configs/icons'

interface Step {
  icon: React.ReactNode
  key: string
}

const stepKeys: Step[] = [
  { icon: <FilesIcon />, key: 'propertyTax' },
  { icon: <LocationIcon />, key: 'location' },
  { icon: <HouseIcon />, key: 'propertyType' },
  { icon: <CubeIcon />, key: 'lotSize' },
  { icon: <CalendarIcon />, key: 'age' },
  { icon: <RenovationsIcon />, key: 'upgrades' },
  { icon: <KeyIcon />, key: 'maintenanceFees' },
  { icon: <CircleStarIcon />, key: 'exposure' }
]

interface StepsItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

const StepsItem: React.FC<StepsItemProps> = ({ icon, title, description }) => {
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
          {description}
        </Typography>
      </Stack>
    </Stack>
  )
}

const FlowSteps = () => {
  const t = useTranslations('Estimates')

  return (
    <Stack
      position="relative"
      py={{ xs: 3, md: 3.5 }}
      px={{ xs: 3, md: 6 }}
      spacing={{ xs: 3, md: 4 }}
    >
      <Typography variant="h2" color="common.white">
        {t('estimateFlowBannerTitle')}
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
          {stepKeys.map(({ icon, key }) => (
            <StepsItem
              key={key}
              icon={icon}
              title={t(`estimateFlowBannerSteps.${key}.title`)}
              description={t(`estimateFlowBannerSteps.${key}.description`)}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

export default FlowSteps
