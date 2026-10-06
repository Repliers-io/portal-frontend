import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import locationConfig from '@configs/location'

import { BoxContainer, ImageBanner } from './components'

const LocationBanner = () => {
  const t = useTranslations()
  const { city } = locationConfig

  return (
    <BoxContainer
      flexDirection={{ xs: 'column-reverse', md: 'row' }}
      imgContent={
        <ImageBanner
          src="https://cdn.repliers.io/sample/IMG-ACT2954377_20.jpg?class=medium"
          alt="Calgary kitchen room banner"
        />
      }
      textContent={
        <Stack spacing={2} pr={{ sm: 5 }}>
          <Typography variant="h2" color="common.white" lineHeight={1.2}>
            {t('Estimates.locationBanner', { city })}
          </Typography>
          <Typography
            variant="body1"
            color="common.white"
            sx={{ lineHeight: 1.4, whiteSpace: 'pre-line' }}
          >
            {t('Estimates.locationDescription', { city })}
          </Typography>
        </Stack>
      }
    ></BoxContainer>
  )
}

export default LocationBanner
