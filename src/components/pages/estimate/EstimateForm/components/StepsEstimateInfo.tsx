import { useFormContext } from 'react-hook-form'

import { Box, Stack, Typography } from '@mui/material'

import { formatFullAddress } from 'utils/properties'

const StepsEstimateInfo = () => {
  const { getValues } = useFormContext()

  const [address, unitNumber] = getValues(['address', 'unitNumber'])

  const estimateAddress = address
    ? formatFullAddress({ ...address, unitNumber })
    : null

  if (!estimateAddress) return <Box sx={{ mb: -0.5 }} />

  return (
    <Stack direction="column" spacing={0.5}>
      <Typography variant="h4" noWrap style={{ whiteSpace: 'pre' }}>
        {estimateAddress}
      </Typography>
    </Stack>
  )
}

export default StepsEstimateInfo
