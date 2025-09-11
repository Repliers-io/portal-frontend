import { type Primitive } from 'utils/formatters'

import { type DetailsGroupType } from './types'

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
