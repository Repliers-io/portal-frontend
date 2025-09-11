import { Link, Stack, Typography } from '@mui/material'

import { fubApiUrl } from '@configs/api'

import { DateLabel } from 'components/atoms'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import { formatAddress } from 'utils/estimates/formatters'

const ProfileBody = () => {
  const { client } = useAgentEstimates()

  const fubURL = client?.externalId
    ? `${fubApiUrl}/${client?.externalId}`
    : undefined

  if (!client) return null

  const fubAddress = client?.data?.fub?.addresses?.[0]
  const formattedFubAddress = fubAddress && formatAddress(fubAddress)

  return (
    <Stack direction="column" spacing={1.5} alignItems="center">
      <Stack direction="row" spacing={0.5}>
        <Typography variant="h4" color="text.secondary">
          Created:
        </Typography>
        <Typography variant="body1">
          <DateLabel value={client.createdOn} />
        </Typography>
      </Stack>
      {formattedFubAddress && (
        <Stack direction="row" spacing={0.5}>
          <Typography variant="h4" color="text.secondary">
            Address:
          </Typography>
          <Typography variant="body1">{formattedFubAddress}</Typography>
        </Stack>
      )}
      {fubURL && (
        <Stack direction="row" spacing={0.5}>
          <Typography variant="h4" color="text.secondary">
            FUB Link:
          </Typography>
          <Link
            target="_blank"
            color="secondary.main"
            variant="body1"
            href={fubURL}
          >
            client profile
          </Link>
        </Stack>
      )}
    </Stack>
  )
}

export default ProfileBody
