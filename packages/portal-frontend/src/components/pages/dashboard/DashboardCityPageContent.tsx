import { Box, Container, Stack } from '@mui/material'

import { type PropertyClass } from '@configs/filters'

import { type ApiStatisticResponse } from 'services/API'

import { DashboardBreadcrumbs } from './components/DashboardBreadcrumbs'
import Statistics from './Statistics'

type DashboardCityPageContentProps = {
  city: string
  citySlug: string
  propertyClass: PropertyClass
  ssrData?: ApiStatisticResponse | null
  moreCities?: { name: string; activeCount: number }[]
}

const DashboardCityPageContent = ({
  city,
  citySlug,
  propertyClass,
  ssrData
}: DashboardCityPageContentProps) => (
  <Box>
    <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
      <Stack spacing={4}>
        <DashboardBreadcrumbs
          city={city}
          citySlug={citySlug}
          propertyClass={propertyClass}
        />

        <Statistics
          showTabs
          city={city}
          ssrData={ssrData}
          propertyClass={propertyClass}
        />
      </Stack>
    </Container>
  </Box>
)

export default DashboardCityPageContent
