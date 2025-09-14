/* eslint-disable import/prefer-default-export */
import { type ChatItem } from './types'

export const hasFilters = (obj: ChatItem) =>
  (obj.params && Object.keys(obj.params).length > 0) ||
  (obj.body && Object.keys(obj.body).length > 0)
