import { APIBase } from './APIBase'
import { type ContactScheduleMethod } from './types'

type ContactCommentRequest = {
  name: string
  email: string
  phone?: string
  message: string
  pageUrl?: string
  // FUB tags naming the form that produced the lead ("Buy", "Sell", "Consult", an agent name).
  tags?: string[]
}

type ContactRequestInfo = {
  name: string
  email: string
  phone: string
  mlsNumber: string
  message?: string
}

type HomeTourRequest = {
  name: string
  email: string
  phone: string
  method: ContactScheduleMethod
  date: string
  time: string
  mlsNumber: string
  // Visitor's note; the schedule route has no field of its own for the financing opt-in.
  message?: string
}

type MeetingRequest = {
  name: string
  email: string
  phone: string
  date: string
  time: string
  estimateId: number
}

class APIContactClass extends APIBase {
  addComment(body: ContactCommentRequest) {
    return this.fetchRaw('/contact/contactus', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  requestInfo(body: ContactRequestInfo) {
    return this.fetchJSON('/contact/requestinfo', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  homeTourRequest(body: HomeTourRequest) {
    return this.fetchJSON('/contact/schedule', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  meetingRequest(body: MeetingRequest) {
    return this.fetchRaw('/contact/schedule/estimate', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  subscribeNewsletter(email: string) {
    return this.fetchRaw('/contact/subscribe/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }
}

export const APIContact = new APIContactClass()
