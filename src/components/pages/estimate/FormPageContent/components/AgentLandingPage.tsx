import { Box } from '@mui/material'

import EstimateForm from '@pages/estimate/EstimateForm'

const AgentLandingPage = () => {
  return (
    <Box
      sx={{
        minHeight: 'calc(100svh - 72px)',
        position: 'relative'
      }}
    >
      <EstimateForm />
    </Box>
  )
}

export default AgentLandingPage
