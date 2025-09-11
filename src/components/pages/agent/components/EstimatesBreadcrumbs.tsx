'use client'

import React from 'react'

import { Breadcrumbs, Link, Skeleton, Typography } from '@mui/material'

import routes from '@configs/routes'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import { useUser } from 'providers/UserProvider'
import { joinNonEmpty } from 'utils/strings'

const EstimatesBreadcrumbs = () => {
  const { profile } = useUser()
  const { client, loading } = useAgentEstimates()

  if (loading)
    return <Skeleton variant="rounded" sx={{ width: 150, height: 24 }} />

  const clientName = client
    ? joinNonEmpty([client.fname, client.lname], ' ') || 'Unknown client'
    : 'Unknown client'

  const clientsPath =
    client?.agentId === profile.clientId ? 'My Clients' : 'Clients'

  return (
    <Breadcrumbs>
      <Link underline="none" color="inherit" href={routes.agent}>
        <Typography color="secondary.main">{clientsPath}</Typography>
      </Link>
      <Typography>{clientName}</Typography>
    </Breadcrumbs>
  )
}

export default EstimatesBreadcrumbs
