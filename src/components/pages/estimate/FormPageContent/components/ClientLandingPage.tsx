import { Box, Container, Stack } from '@mui/material'

import defaultLocation from '@configs/location'
import { EstimateForm } from '@pages/estimate'
import { EstimateFlowBanner, LocationBanner } from '@pages/estimate/Banners'
import { LocationStatistics } from '@pages/estimate/Statistics'
import { HomePageBanner } from '@pages/home/components'

const ClientLandingPage = () => {
  const { city, defaultFilters } = defaultLocation // Use the default city from the search config

  return (
    <Box>
      <HomePageBanner>
        <Container maxWidth="lg">
          <Box
            sx={{
              width: '100%',
              position: 'relative',
              maxWidth: { xs: '100%', md: 'sm' },
              pt: { xs: 4, sm: 8, md: '20vh' },
              pb: { xs: 4, sm: 8 }
            }}
          >
            <EstimateForm />
          </Box>
        </Container>
      </HomePageBanner>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={4}>
          <LocationBanner />
          <LocationStatistics
            name={city}
            {...defaultFilters}
            propertyClass="residential"
          />
          <EstimateFlowBanner />
        </Stack>
      </Container>
    </Box>
  )
}

export default ClientLandingPage
