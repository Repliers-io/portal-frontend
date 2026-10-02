import { APIBase } from './APIBase'

class APIFubUserClass extends APIBase {
  // Adds a tag(s) to the user's boss profile
  addTags(tags: string[]) {
    return this.fetchJSON('/user/boss/tag', {
      method: 'POST',
      body: JSON.stringify({ tags })
    })
  }
}

export const APIFubUser = new APIFubUserClass()
