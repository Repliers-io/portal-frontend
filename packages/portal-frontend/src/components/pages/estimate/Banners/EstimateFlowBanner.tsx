import { Paper, Stack } from '@mui/material'

import { FlowSteps, ImageBanner } from './components'

const EstimateFlowBanner = () => {
  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Stack position="relative" minHeight={317}>
        <ImageBanner
          showOverlay
          boxProps={{ zIndex: 0 }} // show banner behind text content
          src="https://cdn.repliers.io/sample/IMG-CAR4215250_24.jpg?class=medium"
          alt="Banner"
        />

        <FlowSteps />
      </Stack>
    </Paper>
  )
}

export default EstimateFlowBanner
