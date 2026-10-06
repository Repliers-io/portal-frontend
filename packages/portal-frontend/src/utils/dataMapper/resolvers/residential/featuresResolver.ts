// Features section
import sections from '@configs/pdp-sections'

import { type ApiListing } from 'services/API'

import { createResolver, filterEmptyGroups } from '../../utils'

const { groups } = sections.features

export const featuresResolver = (listing: ApiListing) => {
  try {
    const resolve = (items: any) => createResolver(items, listing)
    return filterEmptyGroups(
      groups.map((obj) => ({ ...obj, items: resolve(obj.items) }))
    )
  } catch (error) {
    console.error(
      '[featuresResolver]: Error resolving section properties.',
      error
    )
    return []
  }
}
