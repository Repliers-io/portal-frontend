import { Stack, Typography } from '@mui/material'

import { AddressSection } from '@pages/estimate/EstimateFormSteps/sections'

const AddressStep = () => {
  return (
    <Stack
      spacing={1}
      sx={{
        p: { xs: 2, sm: 3, md: 5 },
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Typography variant="h2" lineHeight={1.2}>
        How Much is My Home worth?
      </Typography>
      <Typography variant="body1">
        Enter your address to get your free estimate instantly.
      </Typography>
      <AddressSection />
    </Stack>
  )
}

export default AddressStep
