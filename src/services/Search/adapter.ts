import type { ListingType } from '@configs/filters'

import { type ApiQueryParams } from 'services/API'

import { optionalTransformers, simpleTransformers } from './declarations'
import { type Transformers, transformers } from './transformers'

const arraysMatch = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false
  const sortedArr1 = [...arr1].sort()
  const sortedArr2 = [...arr2].sort()
  return sortedArr1.every((value, index) => value === sortedArr2[index])
}

export const getListingType = (propertyTypes: string[]) => {
  const keys = Object.keys(optionalTransformers.listingType) as ListingType[]
  for (const key of keys) {
    const params = optionalTransformers.listingType[key]()
    if (
      Array.isArray(params.propertyType) &&
      arraysMatch(params.propertyType.flat(), propertyTypes)
    ) {
      return key
    }
  }
  return undefined
}

const getTransformKeys = (params: Partial<ApiQueryParams>) =>
  Object.keys(params).filter(
    (key): key is keyof ApiQueryParams =>
      Object.keys(simpleTransformers).includes(key) ||
      Object.keys(optionalTransformers).includes(key)
  )

export const transformFilters = (
  keys: any[],
  params: Partial<ApiQueryParams>
) => {
  const result = keys.map((key: keyof ApiQueryParams) => {
    // wrap the value to array, if it's a string
    const value = typeof params[key] === 'string' ? [params[key]] : params[key]

    if (!transformers[key as Transformers]) {
      return { [key]: value }
    } else {
      if (typeof transformers[key as Transformers] === 'function') {
        return transformers[key as Transformers]?.(value)
      }
      return false
    }
  })

  return keys.map((key, index) => ({ ...result[index] }))
}

export const mergeFilters = (groups: Record<string, string>[]) => {
  const merged: Record<string, any> = {}
  groups.forEach((filters) => {
    const filterKeys = Object.keys(filters)

    filterKeys.forEach((filterKey) => {
      if (!merged[filterKey]) {
        merged[filterKey] = filters[filterKey]
      } else {
        merged[filterKey] = [...[merged[filterKey]], ...[filters[filterKey]]]
      }
    })
  })
  return merged
}

export const flattenFilterArrays = (filters: any) => {
  const flattened: Record<string, any> = {}

  Object.keys(filters).forEach((key) => {
    const value = filters[key]

    if (Array.isArray(value)) {
      flattened[key] = [...new Set(value.flat(Infinity))].sort()
    } else {
      flattened[key] = value
    }
  })
  return flattened
}

const removeKeys = (
  keys: (keyof ApiQueryParams)[],
  obj: Partial<ApiQueryParams>
) => {
  const newObj = { ...obj }
  keys.forEach((key) => delete newObj[key])
  return newObj
}

type ApiGetPostParams = {
  get: { [key: string]: unknown }
  post: { [key: string]: unknown }
}

const postKeys: (keyof ApiQueryParams)[] = ['imageSearchItems']

export const createRequestGroups = (
  params: Partial<ApiQueryParams>
): ApiGetPostParams => {
  return Object.entries(params).reduce<ApiGetPostParams>(
    (acc, [key, value]) => {
      if (postKeys.includes(key as keyof ApiQueryParams)) {
        acc.post[key] = value
      } else {
        acc.get[key] = value
      }
      return acc
    },
    { post: {}, get: {} }
  )
}

export const processParams = (params: Partial<ApiQueryParams>) => {
  //
  // Here lies Balin, Son of Fundin, Lord of Moria...
  //

  // This is the main logic of finding and transforming SOME items from
  // the params object, while passing the rest of the object properties as is.
  // We name those items `filters`, but it's not exactly what they are.

  // Step 1: Get keys to transform
  const transformKeys = getTransformKeys(params)

  // Step 2: Transform filters from the params object,
  // extracting them out to an array of groups of filters.
  const transformed = transformFilters(transformKeys, params)

  // Step 3: Merge filters from different groups into one object.
  const merged = mergeFilters(transformed)

  // Step 4: Flatten arrays inside the merged object and remove duplicates
  const flattened = flattenFilterArrays(merged)

  // Step 5: Remove keys that were transformed from the original params object
  // and replace them with the flattened object (of all processed filters)
  const remaining = removeKeys(transformKeys, params)

  // Step 6: split params into GET and POST objects
  const groups = createRequestGroups({ ...remaining, ...flattened })

  return groups
}
