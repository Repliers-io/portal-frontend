import type { EstimateData } from '@configs/estimate'

import type { ApiMessage } from 'services/API'
import { formatDate } from 'utils/formatters'

export const formatEstimateDates = (estimateData: EstimateData) => {
  const { createdOn, updatedOn } = estimateData

  const createdDate = createdOn ? formatDate(createdOn) : 'N/A'
  const updatedDate = updatedOn ? formatDate(updatedOn) : 'N/A'

  return { createdDate, updatedDate }
}

export const sortByRecentDate = (a: ApiMessage, b: ApiMessage) => {
  return (
    new Date(b.delivery.sentDateTime).getTime() -
    new Date(a.delivery.sentDateTime).getTime()
  )
}

export const getMostRecentMessage = (
  messages: ApiMessage[]
): ApiMessage | undefined => {
  const sortedByRecentDate = [...messages].sort(sortByRecentDate)

  return sortedByRecentDate[0]
}

export const formatMostRecentMessageDate = (messages: ApiMessage[]) => {
  const recentMessage = getMostRecentMessage(messages)

  return recentMessage ? formatDate(recentMessage.delivery.sentDateTime) : 'N/A'
}
