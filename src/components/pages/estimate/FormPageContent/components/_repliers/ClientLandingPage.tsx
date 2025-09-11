import { Box, Container } from '@mui/material'

import { EstimateForm } from '@pages/estimate'
import { HomePageBanner } from '@pages/home/components'

const ClientLandingPage = () => {
  return (
    <Box>
      <HomePageBanner>
        <Container maxWidth="lg">
          <Box
            sx={{
              mx: 'auto',
              width: '100%',
              position: 'relative',
              maxWidth: { xs: '100%', md: 'sm' },
              pt: { xs: 4, sm: 8, md: '14vh' },
              pb: { xs: 4, sm: 8 }
            }}
          >
            <EstimateForm />
          </Box>
        </Container>
      </HomePageBanner>
    </Box>
  )
}

export default ClientLandingPage
