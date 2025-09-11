import { Stack, Typography } from '@mui/material'

import { BoxContainer, ImageBanner } from '../components'

const LocationBanner = () => {
  return (
    <BoxContainer
      bgColor="secondary.main"
      flexDirection={{ xs: 'column-reverse', md: 'row' }}
      imgContent={
        <ImageBanner
          src="/polsinello/toronto-banner.webp"
          alt="Interior view of a Toronto house featured in the banner"
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
            Toronto Real Estate
          </Typography>
          <Typography variant="body1" color="common.white" lineHeight={1.4}>
            Your home is one of the most significant financial investments you
            will ever make. Choosing the right real estate team can mean the
            difference between a good investment and a great one. <br /> The
            Polsinello Real Estate Team&#39;s numbers speak for themselves,
            showcasing a history of excellence and a deep-seated trust within
            the communities we serve.
          </Typography>
        </Stack>
      }
    ></BoxContainer>
  )
}

export default LocationBanner
