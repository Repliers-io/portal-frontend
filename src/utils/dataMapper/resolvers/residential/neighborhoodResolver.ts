import sections from '@configs/pdp'

import { type Property } from 'services/API'

import { filterEmptyGroups } from '../../utils'
import createResolver from '../createResolver'

const { groups } = sections.neighborhood

const neighbourhoodResolver = (property: Property) => {
  try {
    const resolve = (items: any) => createResolver(items, property)

    return filterEmptyGroups(
      groups.map((obj) => ({ ...obj, items: resolve(obj.items) }))
    )
  } catch (error) {
    console.error(
      '[neighbourhoodResolver] error resolving section properties.',
      error
    )
    return []
  }
}

export default neighbourhoodResolver
