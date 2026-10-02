import { APIBase } from './APIBase'
import { type ApiChatResponse } from './types'

class APIChatClass extends APIBase {
  fetchReply({ value, token }: { value: string; token?: string }) {
    return this.fetchJSON<ApiChatResponse>('/listings/nlp', {
      method: 'POST',
      body: JSON.stringify({
        nlpId: token,
        prompt: value,
        aggregates: 'map'
      })
    })
  }
}

export const APIChat = new APIChatClass()
