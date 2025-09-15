import sections from '@configs/pdp-condo-sections'

import { type Property } from 'services/API'

import { filterEmptyGroups } from '../../utils'
import createResolver from '../createResolver'

const { groups } = sections.home

const homeResolver = (property: Property) => {
  try {
    const resolve = (items: any) => createResolver(items, property)
    return filterEmptyGroups(
      groups.map((obj) => ({ ...obj, items: resolve(obj.items) }))
    )
  } catch (error) {
    console.error('[homeResolver]: Error resolving section properties.', error)
    return []
  }
}

export default homeResolver
