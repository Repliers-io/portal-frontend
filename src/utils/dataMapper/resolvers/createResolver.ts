import { type Property } from 'services/API'

import { type DetailsItemType, type ResolverItem } from '../types'

/**
 * Resolves a nested property within an object using a dot-separated string path.
 * example user.profile.address.city => 'New York'
 */
const resolvePath = (obj: any, path: string) => {
  const keys = path.split('.')
  return keys.reduce((acc, key) => acc?.[key], obj)
}

/*
 * Resolve and transform data based on the provided configuration
 * */
function createResolver(items: ResolverItem[], property: Property) {
  return items.map(({ label, path, fn }) => {
    if (fn) {
      return {
        label,
        value: fn(property, path ? resolvePath(property, path) : undefined)
      }
    }
    if (path) {
      return {
        label,
        value: resolvePath(property, path)
      }
    }
  }) as DetailsItemType[]
}

export default createResolver
