'use client'

import { Skeleton } from '@mui/material'

import routes from '@configs/routes'
import { type BreadcrumbItem, Breadcrumbs } from '@shared/Breadcrumbs'

import { useAgentEstimates } from 'providers/AgentEstimatesProvider'
import { useUser } from 'providers/UserProvider'
import { joinNonEmpty } from 'utils/strings'

export const EstimatesBreadcrumbs = () => {
  const { profile } = useUser()
  const { client, loading } = useAgentEstimates()

  if (loading)
    return <Skeleton variant="rounded" sx={{ width: 150, height: 24 }} />

  const clientName = client
    ? joinNonEmpty([client.fname, client.lname], ' ') || 'Unknown client'
    : 'Unknown client'

  const clientsPath =
    client?.agentId === profile.clientId ? 'My Clients' : 'Clients'

  const items: BreadcrumbItem[] = [
    { label: clientsPath, href: routes.agent },
    { label: clientName }
  ]

  return <Breadcrumbs items={items} />
}
