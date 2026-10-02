import { type ApiListing } from 'services/API'
import { type ApiChatRequestData } from 'services/API'
import { type Filters } from 'services/Search'

export type ChatCarouselData = {
  title?: string
  count: number
  listings: ApiListing[]
  filters: Partial<Filters>
}

export type ChatItem = {
  value: string
  type: 'ai' | 'client'
  error?: boolean
  timestamp?: number
  carousel?: ChatCarouselData
} & ApiChatRequestData
