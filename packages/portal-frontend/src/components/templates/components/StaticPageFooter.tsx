import { Box } from '@mui/material'

import {
  PopularCities,
  PopularCondos,
  PopularHoods
} from '@pages/locations/components'

export const StaticPageFooter = () => {
  return (
    <Box pt={{ xs: 2, sm: 4, md: 6 }}>
      <PopularCities />
      <PopularHoods />
      <PopularCondos />
    </Box>
  )
}
