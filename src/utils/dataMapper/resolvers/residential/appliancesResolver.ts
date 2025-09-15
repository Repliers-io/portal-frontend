// Appliances & Equipment section
import sections from '@configs/pdp-sections'

import { type Property } from 'services/API'

import { filterEmptyGroups } from '../../utils'
import createResolver from '../createResolver'

const { groups } = sections.appliances

const appliancesEquipmentResolver = (property: Property) => {
  try {
    const resolve = (items: any) => createResolver(items, property)
    return filterEmptyGroups(
      groups.map((obj) => ({ ...obj, items: resolve(obj.items) }))
    )
  } catch (error) {
    console.error(
      '[appliancesEquipmentResolver]: Error resolving section properties.',
      error
    )
    return []
  }
}

export default appliancesEquipmentResolver
