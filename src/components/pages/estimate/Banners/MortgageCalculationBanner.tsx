import React from 'react'

import { Box, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'

import IcoFile from '@icons/IcoFile'
import IcoHouse from '@icons/IcoHouse'
import IcoRocket from '@icons/IcoRocket'
import IcoWork from '@icons/IcoWork'
import { BlurredContainer } from '@shared/Containers'

import { useEstimate } from 'providers/EstimateProvider'
import { formatEnglishPrice } from 'utils/formatters'

import { CalculationItem } from './components'
import { useBannersData } from './hooks'

type Props = {
  blurred?: boolean
}

const MortgageCalculationBanner: React.FC<Props> = ({ blurred = false }) => {
  const { estimateData, showStep } = useEstimate()
  const { estimate = 0 } = estimateData || {}
  const {
    formattedMortgage,
    formattedClosingCosts,
    formattedCalculatedNetEquity,
    blurredMortgageCalculation
  } = useBannersData()

  const calculationItems = [
    {
      icon: <IcoHouse color="#6ECDFF" />,
      prefix: null,
      value: formatEnglishPrice(Math.round(estimate)),
      label: 'Estimated Home Value'
    },
    {
      icon: <IcoFile color="#6ECDFF" />,
      prefix: '−',
      value: formattedMortgage,
      label: 'Estimated Loan Balance'
    },
    {
      icon: <IcoWork color="#6ECDFF" />,
      prefix: '−',
      value: formattedClosingCosts + ' *',
      label: 'Estimated Closing Fees'
    },
    {
      icon: <IcoRocket color="#6ECDFF" />,
      prefix: '=',
      value: formattedCalculatedNetEquity,
      label: 'Estimated Net Equity'
    }
  ]

  return (
    <BlurredContainer
      blurred={blurred || blurredMortgageCalculation}
      onClick={() => showStep(4)}
    >
      <Grid
        container
        borderRadius={3}
        overflow="hidden"
        flexDirection="row"
        bgcolor="common.white"
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Box py={3} pl={{ xs: 3, md: 5 }} pr={3}>
            <Typography variant="h3" maxWidth={400}>
              If you sold your home today, you could walk away with:
            </Typography>
            <Typography variant="h1" my={2} color="primary.main" lineHeight={1}>
              {blurred ? '$XXX,XXX' : formattedCalculatedNetEquity}
            </Typography>
            <Typography maxWidth={500}>
              These calculations are estimates based on information you provided
              and may not reflect actual market value. Please speak with one of
              our licensed REALTORS® for a comprehensive evaluation.
            </Typography>
          </Box>
        </Grid>
        <Grid
          p={3}
          position="relative"
          size={{ xs: 12, md: 6 }}
          minHeight={{ xs: 180, md: 150 }}
          bgcolor="primary.dark"
        >
          <Typography variant="h3" color="common.white">
            How is this calculated?
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            mt={3}
          >
            {calculationItems.map((item, index) => (
              <CalculationItem {...item} key={index} />
            ))}
          </Stack>
          <Typography
            display="block"
            variant="caption"
            color="common.white"
            mt={2}
          >
            * These calculations are illustrative, and may not be complete.
            Actual costs may vary.
          </Typography>
        </Grid>
      </Grid>
    </BlurredContainer>
  )
}

export default MortgageCalculationBanner
