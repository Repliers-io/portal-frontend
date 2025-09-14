'use client'

import React from 'react'
import Image from 'next/legacy/image'

import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import { BlurredContainer } from '@shared/Containers'

import { useEstimate } from 'providers/EstimateProvider'
import { toRem } from 'utils/theme'

import { useBannersData } from './hooks'

type Props = {
  blurred?: boolean
}

const MortgageEquityBanner: React.FC<Props> = ({ blurred = false }) => {
  const { showStep } = useEstimate()

  const {
    equityGain,
    formattedEquity,
    formattedEquityRate,
    blurredMortgageEquity
  } = useBannersData()

  const equityColor = equityGain === 'decrease' ? 'error.main' : 'primary.main'

  return (
    <BlurredContainer
      blurred={blurred || blurredMortgageEquity}
      onClick={() => showStep(4)}
    >
      <Grid container flexDirection="row" bgcolor="common.white">
        <Grid size={{ xs: 12, md: 6 }}>
          <Box py={3} pl={{ xs: 3, md: 5 }} pr={3}>
            <Typography variant="h3" color="text.primary">
              The estimated equity in your home is:
            </Typography>
            <Typography variant="h1" my={2} color="primary.main" lineHeight={1}>
              {blurred ? '$XXX,XXX' : formattedEquity}
            </Typography>
            <Typography
              variant="body2"
              fontSize={toRem(16)}
              lineHeight={toRem(22)}
              maxWidth={400}
            >
              Our estimate indicates a{' '}
              <Typography component="span" color={equityColor}>
                {blurred ? 'XX%' : formattedEquityRate} {equityGain}
              </Typography>{' '}
              in your property’s value since you purchased it.
            </Typography>
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          position="relative"
          minHeight={{ xs: 180, md: 150 }}
        >
          <Box
            width="100%"
            height="100%"
            position="absolute"
            bgcolor="background.paper"
          >
            <Image
              unoptimized
              layout="fill"
              objectFit="cover"
              objectPosition="left center"
              src="/justinhavre-avm/estimate-equity-banner.webp"
              alt="Kitchen home banner picture"
            />
          </Box>
        </Grid>
      </Grid>
    </BlurredContainer>
  )
}

export default MortgageEquityBanner
