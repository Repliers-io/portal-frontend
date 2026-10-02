import { useTranslations } from 'next-intl'

import { Link, Stack, Typography } from '@mui/material'

import apiConfig from '@configs/api'

import { DateLabel } from 'components/atoms'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import { formatAddress } from 'utils/estimates/formatters'

const ProfileBody = () => {
  const { client } = useAgentEstimates()
  const t = useTranslations('Agent')

  const fubURL = client?.externalId
    ? `${apiConfig.fubApiUrl}/${client?.externalId}`
    : undefined

  if (!client) return null

  const fubAddress = client?.data?.fub?.addresses?.[0]
  const formattedFubAddress = fubAddress && formatAddress(fubAddress)

  return (
    <Stack direction="column" spacing={1.5} alignItems="center">
      <Stack direction="row" spacing={0.5}>
        <Typography variant="h4" color="text.secondary">
          {t('created')}
        </Typography>
        <Typography variant="body1">
          <DateLabel value={client.createdOn} />
        </Typography>
      </Stack>
      {formattedFubAddress && (
        <Stack direction="row" spacing={0.5}>
          <Typography variant="h4" color="text.secondary">
            {t('address')}
          </Typography>
          <Typography variant="body1">{formattedFubAddress}</Typography>
        </Stack>
      )}
      {fubURL && (
        <Stack direction="row" spacing={0.5}>
          <Typography variant="h4" color="text.secondary">
            {t('fubLink')}
          </Typography>
          <Link
            target="_blank"
            color="secondary.main"
            variant="body1"
            href={fubURL}
          >
            {t('clientProfile')}
          </Link>
        </Stack>
      )}
    </Stack>
  )
}

export default ProfileBody
