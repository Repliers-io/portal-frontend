// Exterior Feature section
import sections from '@configs/pdp-condo'

import { type Property } from 'services/API'

import { filterEmptyGroups } from '../../utils'
import createResolver from '../createResolver'

const { groups } = sections.exterior

const propertyInformationResolver = (property: Property) => {
  try {
    const resolve = (items: any) => createResolver(items, property)
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

export default propertyInformationResolver
