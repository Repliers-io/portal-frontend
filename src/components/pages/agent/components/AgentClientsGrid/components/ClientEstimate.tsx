import { Box, Link, Stack, Typography } from '@mui/material'

import type { EstimateData } from '@configs/estimate'

import type { ApiClient } from 'services/API'
import { useEstimateUrl } from 'providers/EstimateProvider'
import { formatEnglishPrice } from 'utils/formatters'
import { formatFullAddress } from 'utils/properties'

const formatEstimateAddress = (estimateData?: EstimateData | null) => {
  const { payload } = estimateData || {}
  const { address } = payload || {}
  return address ? formatFullAddress(address) : 'Unknown address'
}

const EstimateAddress = ({
  estimateData,
  client
}: {
  estimateData: EstimateData
  client: ApiClient
}) => {
  const { estimateId, ulid } = estimateData
  const { clientId } = client
  const { getEstimateUrl } = useEstimateUrl('route', clientId)

  return (
    <Link href={getEstimateUrl(ulid || estimateId)} underline="hover">
      <Typography variant="body2">
        {formatEstimateAddress(estimateData)}
      </Typography>
    </Link>
  )
}

const EstimateCount = ({ count }: { count: number }) => (
  <Box
    sx={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      backgroundColor: 'transparent',
      border: 1,
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: 'secondary.main'
    }}
  >
    <Typography variant="body2" color="secondary.main" fontSize="9px">
      +{count}&nbsp;
    </Typography>
  </Box>
)

const EstimatePrice = ({ estimate }: { estimate: number }) => (
  <Typography variant="body2">
    {formatEnglishPrice(Math.round(estimate))}
  </Typography>
)

const ClientEstimate = ({ client }: { client: ApiClient }) => {
  if (!client.estimates?.length) return null

  const estimateData = client.estimates[0]
  const estimate = estimateData.estimate || 0

  return (
    <Stack direction="column" spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <EstimateAddress estimateData={estimateData} client={client} />
        {client.estimates.length > 1 && (
          <EstimateCount count={client.estimates.length - 1} />
        )}
      </Stack>
      <Stack direction="row" spacing={1}>
        <EstimatePrice estimate={estimate} />
      </Stack>
      <Typography variant="body2">
        Notifications: {estimateData.sendEmailMonthly ? 'Monthly' : 'None'}
      </Typography>
    </Stack>
  )
}

export default ClientEstimate
