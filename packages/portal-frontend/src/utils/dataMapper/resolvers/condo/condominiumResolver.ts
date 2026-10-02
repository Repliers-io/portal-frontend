import sections from '@configs/pdp-condo-sections'

import { type ApiListing } from 'services/API'

import { type DetailsGroupType } from '../../types'
import { createResolver, filterEmptyGroups } from '../../utils'

export const condominiumResolver = (listing: ApiListing) => {
  const groups = (
    sections as unknown as { condominium?: { groups: DetailsGroupType[] } }
  ).condominium?.groups
  if (!groups) return []

  try {
    const resolve = (items: any) => createResolver(items, listing)
    return filterEmptyGroups(
      groups.map((obj) => ({ ...obj, items: resolve(obj.items) }))
    )
  } catch (error) {
    console.error(
      '[condominiumResolver]: Error resolving section properties.',
      error
    )
    return []
  }
}
