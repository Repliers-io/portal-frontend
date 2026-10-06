import type {
  ApiAgentsResponse,
  ApiFUBUser,
  FubUser,
  FubUsersResponse
} from 'services/API'

import { extractChanges } from '../diff'

const mapApiFubUser = (user: ApiFUBUser): FubUser => {
  const { repliers, ...rest } = user
  return {
    ...rest,
    ...(repliers.length ? { repliers: repliers[0] } : {})
  }
}

const mapApiFubUserWithChanges = (agent: ApiFUBUser): FubUser => {
  const fubUser: FubUser = { ...mapApiFubUser(agent) }
  const changes = extractChanges(fubUser)

  if (changes) {
    fubUser.changes = changes
  }

  return fubUser
}

const mapResponse = (response: ApiAgentsResponse): FubUsersResponse => {
  return {
    ...response,
    agents: response.agents.map(mapApiFubUserWithChanges)
  }
}

export default mapResponse
