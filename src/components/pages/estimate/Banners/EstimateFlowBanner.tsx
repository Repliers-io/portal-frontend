import { Stack } from '@mui/material'

import { FlowSteps, ImageBanner } from './components'

const EstimateFlowBanner = () => {
  return (
    <Stack
      position="relative"
      minHeight={317}
      borderRadius={3}
      overflow="hidden"
    >
      <ImageBanner
        showOverlay
        boxProps={{ zIndex: 0 }} // show banner behind text content
        src="/justinhavre-avm/estimate-flow-banner.webp"
        alt="Banner"
      />

      <FlowSteps />
    </Stack>
  )
}

export default EstimateFlowBanner
