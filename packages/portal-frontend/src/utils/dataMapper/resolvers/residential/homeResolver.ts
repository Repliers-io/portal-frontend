import sections from '@configs/pdp-sections'

import {
  // type ApiLastStatus,
  // listingLastStatusMapping,
  type ApiListing
} from 'services/API'

import { createResolver, filterEmptyGroups } from '../../utils'

const { groups } = sections.home

export const homeResolver = (listing: ApiListing) => {
  try {
    const resolve = (items: any) => createResolver(items, listing)
    const filtered = filterEmptyGroups(
      groups.map((obj) => ({ ...obj, items: resolve(obj.items) }))
    )
    return filtered
  } catch (error) {
    console.error('[homeResolver] error resolving section properties.', error)
    return []
  }
}
