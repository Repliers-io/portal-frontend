import { useTranslations } from 'next-intl'

import { Button, Stack, Typography } from '@mui/material'

import { ArrowBackIosIcon, RefreshIcon } from '@configs/icons'
import routes from '@configs/routes'

import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'

import StepsEstimateInfo from './StepsEstimateInfo'

const StepsHeader = () => {
  const t = useTranslations('Estimates.form')
  const { agentRole } = useUser()
  const { clientId, estimateId, signature, resetForm } = useEstimate()

  const clientRoute = clientId
    ? `${routes.agentClient}/${clientId}${signature ? `?s=${signature}` : ''}`
    : routes.agent

  return (
    <Stack
      spacing={2}
      sx={{ borderRadius: 2, bgcolor: 'background.paper', p: 2 }}
      justifyContent="flex-start"
    >
      <Typography variant="h3" noWrap>
        {t('header.title', {
          mode: estimateId ? 'edit' : 'other',
          owner: agentRole ? 'agent' : 'other'
        })}
      </Typography>
      <StepsEstimateInfo />
      {agentRole ? (
        <Stack
          spacing={2}
          width="100%"
          direction="row"
          justifyContent="stretch"
        >
          <Button
            variant="outlined"
            href={clientRoute}
            startIcon={<ArrowBackIosIcon />}
            sx={{ flex: { xs: 1, md: 1.3 } }}
          >
            {clientId ? t('header.backToClient') : t('header.backToClients')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={resetForm}
            sx={{ flex: { xs: 1, md: 0.7 } }}
          >
            {t('header.restart')}
          </Button>
        </Stack>
      ) : null}
    </Stack>
  )
}

export default StepsHeader
