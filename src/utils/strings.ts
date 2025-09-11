import { notAvailableString } from '@configs/properties'

import { type Primitive } from './formatters'

export const capitalize = (str: Primitive) =>
  typeof str === 'string'
    ? str.replace(
        /(^|\s)([A-Za-z])/g,
        (_match, prefix, char) => prefix + char.toUpperCase()
      ) // only uppercase letters at start or after whitespace, ignore punctuation boundaries
    : ''

export const pluralize = (
  count: number,
  forms: { one: string; many: string; zero?: string }
): string => {
  const word =
    forms[
      Math.abs(count) === 1
        ? 'one'
        : typeof forms.zero !== 'undefined' && count === 0
          ? 'zero'
          : 'many'
    ]
  return word!.replace('$', Number(count).toLocaleString())
}

export const notNA = (str: string) => str && str !== notAvailableString

export const joinNonEmpty = (items: Primitive[], separator = ', ') => {
  return items
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .filter((str) => notNA(str))
    .join(separator)
}
/**
 * @deprecated should be replaced with array operations
 */
export const addSpaceAfterComma = (input: unknown) => {
  if (typeof input !== 'string') return null
  return input.replace(/,/g, ', ')
}

export const removeDuplicates = (items: Primitive[]) => {
  return [...new Set(items)]
}

export const random = (length = 8) => {
  const characters: string =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  if (!Number.isFinite(length) || length < 1) return result
  while (result.length < length) {
    // eslint-disable-next-line no-bitwise
    const randomIndex = (Math.random() * characters.length) << 0
    result += characters[randomIndex]
  }

  return result
}

export const formatUnionKey = (value: string): string => {
  return value
    .split(/(?=[A-Z0-9])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const keyToLabel = (value: string) => {
  const result = value.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

export const labelToKey = (label: string): string => {
  if (!label) return ''

  let s = label
    .replace(/[-_]+/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toLowerCase()
  s = s.replace(/\s+(.)/g, function (match, group1) {
    return group1.toUpperCase()
  })
  s = s.replace(/\s/g, '')
  return s
}
