import APIBase from './APIBase'
import { type ApiClientAgent, type ApiUserProfile } from './types'

class APIUser extends APIBase {
  // NOTE: never used in the app
  fetch() {
    return this.fetchJSON<ApiUserProfile>('/user/me')
  }

  fetchAgent() {
    return this.fetchJSON<ApiClientAgent>('/user/agent')
  }

  update(body: Partial<ApiUserProfile>): Promise<ApiUserProfile> {
    return this.fetchJSON('/user', {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
  }

  register(data: Partial<ApiUserProfile>): Promise<ApiUserProfile> {
    return this.fetchJSON('/agent/client', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

const apiUserInstance = new APIUser()
export default apiUserInstance
