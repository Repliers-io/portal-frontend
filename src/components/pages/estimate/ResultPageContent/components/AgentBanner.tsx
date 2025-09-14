import React from 'react'

import HolidayVillageIcon from '@mui/icons-material/HolidayVillage'
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined'
import { Button, Paper, Skeleton, Stack } from '@mui/material'

import routes from '@configs/routes'
import { SendEstimateButton, UpdateEmailNotification } from '@shared/Estimate'
import EstimateDateDetails from '@shared/Widgets/EstimateDateDetails'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import { useEstimate } from 'providers/EstimateProvider'
import { joinNonEmpty } from 'utils/strings'

import { EstimateDetailsContainer } from '.'

const useLastSendEmailOn = (estimateId?: number) => {
  const { estimates } = useAgentEstimates()

  if (!estimateId) return undefined

  const estimate = estimates.find((est) => est.estimateId === estimateId)
  return estimate?.lastSendEmailOn
}

const AgentBanner = () => {
  const { client, signature, loading } = useAgentEstimates()
  const { estimateData } = useEstimate()
  const { clientId, estimateId } = estimateData || {}

  // Get lastSendEmailOn for the current estimate from local state for avoid heavy API calls
  const lastSendEmailOn = useLastSendEmailOn(estimateId)

  if (!client && loading) {
    return (
      <Skeleton
        sx={{ width: '100%', height: 284, bgcolor: 'white', borderRadius: 3 }}
        variant="rounded"
      />
    )
  }

  if (!estimateId || !client) return null

  const clientName = client
    ? joinNonEmpty([client.fname, client.lname], ' ') || 'Unknown client'
    : 'Unknown client'

  const clientLink = `${routes.agentClient}/${clientId}${signature ? `?s=${signature}` : ''}`

  return (
    <Paper>
      <EstimateDetailsContainer
        title={`This estimate was prepared for ${loading ? '...' : clientName}`}
      >
        {estimateData && (
          <>
            <Stack direction="column" spacing={2}>
              <EstimateDateDetails
                estimateData={estimateData}
                lastSendEmailOn={lastSendEmailOn}
                layout="row"
              />
              <UpdateEmailNotification
                estimateData={estimateData}
                label="Subscribe client to monthly notifications"
              />
            </Stack>
            <Stack
              direction={{
                xs: 'column',
                sm: 'row'
              }}
              gap={3}
              flexWrap="wrap"
            >
              <Button
                color="secondary"
                variant="outlined"
                href={clientLink}
                startIcon={<HolidayVillageIcon sx={{ fontSize: 14 }} />}
              >
                Go to client’s profile
              </Button>

              <SendEstimateButton
                color="secondary"
                variant="outlined"
                estimateId={estimateId}
                icon={<IosShareOutlinedIcon sx={{ fontSize: 14 }} />}
              />
            </Stack>
          </>
        )}
      </EstimateDetailsContainer>
    </Paper>
  )
}

export default AgentBanner
