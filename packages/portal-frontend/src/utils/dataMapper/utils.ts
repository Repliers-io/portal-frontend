import listingsConfig from '@configs/listings'

import { type ApiListing } from 'services/API'
import { type Primitive } from 'utils/formatters'

import { dateMappers } from './mappers'
import {
  type DetailsGroupType,
  type DetailsItemType,
  type ResolverItem
} from './types'

export const isEmptyValue = (value: Primitive | string[]) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'number' && value === 0) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (typeof value === 'string' && value === '0') return true
  if (typeof value === 'string' && value === '0.00') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

const transformEmptyGroupToNull = (group: DetailsGroupType) => {
  const filteredItems = group.items.filter((item) => !isEmptyValue(item.value))
  const isNotEmptyGroup = filteredItems.length > 0
  return isNotEmptyGroup ? { ...group, items: filteredItems } : null
}

export const filterEmptyGroups = (groups: DetailsGroupType[]) =>
  groups.map(transformEmptyGroupToNull).filter(Boolean) as DetailsGroupType[]

export function sanitizeStringWithDelimiter(
  value: string | undefined,
  delimiter?: RegExp | string
): string[] | null {
  return value
    ? value
        .split(delimiter || ',')
        .map((item: string) => item.trim())
        .filter(Boolean)
    : null
}

export function sanitizeItems(items: string[] | undefined): string[] | null {
  return items ? items.map((item: string) => item.trim()).filter(Boolean) : null
}

/**
 * Resolves a nested property within an object using a dot-separated string path.
 * example user.profile.address.city => 'New York'
 */
const resolvePath = (obj: any, path: string) => {
  const keys = path.split('.')
  return keys.reduce((acc, key) => acc?.[key], obj)
}

/**
 * Resolve and transform data based on the provided field configuration.
 */
export function createResolver<T = ApiListing>(
  items: ResolverItem<T>[],
  source: T
) {
  return items.map(({ label, path, fn }) => {
    if (fn) {
      return {
        label,
        value: fn(source, path ? resolvePath(source, path) : undefined),
        ...(dateMappers.has(fn) && {
          scrubbedValue: listingsConfig.scrubbed.datePlaceholder
        })
      }
    }
    if (path) {
      return {
        label,
        value: resolvePath(source, path)
      }
    }
  }) as DetailsItemType[]
}
