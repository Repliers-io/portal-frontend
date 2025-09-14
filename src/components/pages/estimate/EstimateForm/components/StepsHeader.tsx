import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Stack, Typography } from '@mui/material'

import routes from '@configs/routes'

import { useEstimate } from 'providers/EstimateProvider'
import { useUser } from 'providers/UserProvider'

import StepsEstimateInfo from './StepsEstimateInfo'

const StepsHeader = () => {
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
        {estimateId ? 'Edit' : 'Fill in'} details of{' '}
        {agentRole ? 'the' : 'your'} property
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
            Back to {clientId ? 'Client' : 'Clients'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={resetForm}
            sx={{ flex: { xs: 1, md: 0.7 } }}
          >
            Restart
          </Button>
        </Stack>
      ) : null}
    </Stack>
  )
}

export default StepsHeader
