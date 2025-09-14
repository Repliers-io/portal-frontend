import { Stack } from '@mui/material'

import MapCard from './components/MapCard'
import StreetViewCard from './components/StreetViewCard'
import VirtualTourCard from './components/VirtualTourCard'

const ShowcaseCards = () => {
  return (
    <Stack direction="row" spacing={{ xs: 2 }} flexWrap="wrap">
      <MapCard />
      <StreetViewCard />
      <VirtualTourCard />
    </Stack>
  )
}

export default ShowcaseCards
