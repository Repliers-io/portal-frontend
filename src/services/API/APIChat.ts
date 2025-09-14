import APIBase from './APIBase'

type APIChatResponse = {
  nlpId: string
  request: {
    body?: { [key: string]: any }
    params?: { [key: string]: string }
    summary: string
  }
}

class APIChat extends APIBase {
  fetchReply({ value, token }: { value: string; token?: string }) {
    return this.fetchJSON<APIChatResponse>('/listings/nlp', {
      method: 'POST',
      body: JSON.stringify({ prompt: value, nlpId: token })
    })
  }
}

const apiChat = new APIChat()
export default apiChat
