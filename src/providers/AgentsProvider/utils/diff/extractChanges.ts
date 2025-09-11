import type { FubUser, FubUserDiff } from 'services/API'

import { mapToAgent } from '../mapping'

import { diffAgent } from '.'

const extractChanges = (fubUser: FubUser): FubUserDiff[] | null => {
  const agentMappedFields = mapToAgent(fubUser)
  const agent = fubUser.repliers

  if (!agent) return null

  const agentDiff = diffAgent(agentMappedFields, agent)

  return agentDiff.length ? agentDiff : null
}

export default extractChanges
