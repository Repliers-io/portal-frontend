// Exterior Feature section
import sections from '@configs/pdp-condo-sections'

import { type ApiListing } from 'services/API'

import { createResolver, filterEmptyGroups } from '../../utils'

const { groups } = sections.exterior

export const exteriorResolver = (listing: ApiListing) => {
  try {
    const resolve = (items: any) => createResolver(items, listing)
    return filterEmptyGroups(
      groups.map((obj) => ({ ...obj, items: resolve(obj.items) }))
    )
  } catch (error) {
    console.error(
      '[propertyInformationResolver]: Error resolving section properties.',
      error
    )
    return []
  }
}
