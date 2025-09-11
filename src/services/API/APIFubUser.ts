import APIBase from './APIBase'

class APIFubUser extends APIBase {
  // Adds a tag(s) to the user's boss profile
  addTags(tags: string[]) {
    return this.fetchJSON('/user/boss/tag', {
      method: 'POST',
      body: JSON.stringify({ tags })
    })
  }
}

const apiFubUserInstance = new APIFubUser()

export default apiFubUserInstance
