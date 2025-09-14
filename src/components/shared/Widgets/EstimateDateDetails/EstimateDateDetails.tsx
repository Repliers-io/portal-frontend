import React from 'react'

import {
  CircularProgress,
  Divider,
  Stack,
  type StackOwnProps,
  Typography
} from '@mui/material'

import type { EstimateData } from '@configs/estimate'

import { type ApiMessage } from 'services/API'
import { formatDate } from 'utils/formatters'

import useFetchMessages from './useFetchMessages'
import { formatEstimateDates, formatMostRecentMessageDate } from './utils'

interface EstimateDateDetailsProps extends StackOwnProps {
  estimateData: EstimateData
  lastSendEmailOn?: string // External lastSendEmailOn from AgentEstimatesProvider
  layout?: 'row' | 'column'
}

// Helper function to determine the last email sent date with a clear priority order
const getEmailSendDate = (
  estimateData: EstimateData,
  externalLastSendEmailOn?: string,
  messages: ApiMessage[] = []
): string => {
  // Priority 1: External lastSendEmailOn (from AgentEstimatesProvider)
  if (externalLastSendEmailOn) {
    return formatDate(externalLastSendEmailOn) as string
  }

  // Priority 2: lastSendEmailOn from estimateData
  if (estimateData.lastSendEmailOn) {
    return formatDate(estimateData.lastSendEmailOn) as string
  }

  // Priority 3: Most recent message date
  return formatMostRecentMessageDate(messages) as string
}

const EstimateDateDetails: React.FC<EstimateDateDetailsProps> = ({
  estimateData,
  lastSendEmailOn,
  layout = 'column'
}) => {
  const { estimateId } = estimateData
  const { messages, loading } = useFetchMessages(estimateId)

  if (!estimateId) return null

  const { createdDate, updatedDate } = formatEstimateDates(estimateData)

  const emailSendDate = getEmailSendDate(
    estimateData,
    lastSendEmailOn,
    messages
  )

  const divider =
    layout === 'row' ? (
      <Divider
        orientation="vertical"
        sx={{
          borderColor: 'text.secondary'
        }}
        flexItem
      />
    ) : null

  const spacing = layout === 'row' ? 2 : 1

  return (
    <Stack direction={layout} divider={divider} gap={spacing} flexWrap="wrap">
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Typography variant="body1" color="text.secondary">
          Created:
        </Typography>
        <Typography variant="body1">{createdDate}</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Typography variant="body1" color="text.secondary">
          Last Updated:
        </Typography>
        <Typography variant="body1">{updatedDate}</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Typography variant="body1" color="text.secondary">
          Last Email Sent:
        </Typography>
        <Typography variant="body1" alignItems="center">
          {loading ? (
            <CircularProgress
              size={16}
              color="secondary"
              sx={{ mx: 1, my: -0.5 }}
            />
          ) : (
            emailSendDate
          )}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default EstimateDateDetails
