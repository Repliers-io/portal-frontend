export type ChatItem = {
  value: string
  type: 'ai' | 'client'
  params?: { [key: string]: any }
  body?: { [key: string]: any }
}
