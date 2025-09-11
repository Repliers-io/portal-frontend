import React from 'react'

import { Link, Typography } from '@mui/material'

import { type EstimateData } from '@configs/estimate'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import { formatFullAddress } from 'utils/properties'
import { toRem } from 'utils/theme'

const HouseAddress = ({ estimateData }: { estimateData: EstimateData }) => {
  const { getEstimateUrl } = useAgentEstimates()
  const { payload, estimateId, ulid } = estimateData
  const { address } = payload || {}

  const fullAddress = address ? formatFullAddress(address) : 'Unknown address'
  const estimateUrl = getEstimateUrl(ulid || estimateId)

  return (
    <Typography
      variant="h3"
      sx={{
        fontSize: {
          xs: toRem(20),
          md: toRem(24)
        }
      }}
    >
      <Link href={estimateUrl} underline="hover">
        {fullAddress}
      </Link>
    </Typography>
  )
}

export default HouseAddress
