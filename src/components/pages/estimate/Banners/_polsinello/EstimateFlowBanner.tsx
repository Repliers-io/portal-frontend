import { Stack } from '@mui/material'

import { FlowSteps, ImageBanner } from '../components'

const EstimateFlowBanner = () => {
  return (
    <Stack
      position="relative"
      minHeight={317}
      borderRadius={3}
      overflow="hidden"
    >
      <ImageBanner
        boxProps={{ zIndex: 0 }} // show banner behind text content
        showOverlay
        src="/polsinello/estimate-flow-banner.webp"
        overlayColor="secondary.main"
        alt="Banner"
      />

      <FlowSteps />
    </Stack>
  )
}

export default EstimateFlowBanner
