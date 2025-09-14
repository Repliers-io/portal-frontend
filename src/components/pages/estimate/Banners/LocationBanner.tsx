import { useTranslations } from 'next-intl'

import { Stack, Typography } from '@mui/material'

import defaultLocation from '@configs/location'

import { BoxContainer, ImageBanner } from './components'

const LocationBanner = () => {
  const t = useTranslations()
  const { city } = defaultLocation

  return (
    <BoxContainer
      flexDirection={{ xs: 'column-reverse', md: 'row' }}
      imgContent={
        <ImageBanner
          src="/justinhavre-avm/calgary-banner.webp"
          alt="Calgary kitchen room banner"
        />
      }
      textContent={
        <Stack
          spacing={2}
          pr={{
            sm: 5
          }}
        >
          <Typography variant="h2" color="common.white" lineHeight={1.2}>
            {t('Estimates.locationBannerTitle', { city })}
          </Typography>
          <Typography variant="body1" color="common.white" lineHeight={1.4}>
            Discover your {city} home&#39;s current market value with real-time
            data and comprehensive market insights. Track {city} real estate
            trends including average home prices, days on market, and active
            inventory levels across all neighbourhoods. Whether you&#39;re
            considering selling or simply want to understand what your home is
            worth in today&#39;s market, our {city} home valuation tool provides
            accurate estimates based on recent sales data and current market
            conditions. Get instant access to {city} housing statistics and see
            how your neighbourhood compares to the broader market.
          </Typography>
        </Stack>
      }
    ></BoxContainer>
  )
}

export default LocationBanner
