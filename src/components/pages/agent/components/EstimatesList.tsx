import React from 'react'

import { Stack, Typography } from '@mui/material'

import { type EstimateData } from '@configs/estimate'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'

import { EstimateCard, EstimateCardSkeleton } from '.'

const getDate = (estimate: EstimateData): number => {
  const date = estimate.updatedOn || estimate.createdOn || ''
  return new Date(date).getTime() || 0
}

const compareDates = (a: EstimateData, b: EstimateData): number => {
  return getDate(b) - getDate(a)
}

const EstimatesList = () => {
  const { estimates, loading } = useAgentEstimates()

  const sortedEstimates = [...estimates].sort(compareDates)

  if (loading && !sortedEstimates.length) {
    return (
      <>
        {Array.from({ length: 2 }).map((_, index) => (
          <EstimateCardSkeleton key={index} />
        ))}
      </>
    )
  }

  if (!sortedEstimates.length) {
    return (
      <Stack spacing={3} alignItems="center" py={3}>
        <Typography variant="h3">No estimates available</Typography>
      </Stack>
    )
  }

  return (
    <>
      {sortedEstimates.map((item) => (
        <EstimateCard estimate={item} key={item.estimateId} />
      ))}
    </>
  )
}

export default EstimatesList
