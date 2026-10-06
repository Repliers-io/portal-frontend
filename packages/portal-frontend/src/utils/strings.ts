import listingsConfig from '@configs/listings'

import { formatEnglishNumber, type Primitive } from './formatters'

export const capitalize = (str: Primitive) =>
  typeof str === 'string'
    ? str.replace(
        /(^|\s)([A-Za-z])/g,
        (_match, prefix, char) => prefix + char.toUpperCase()
      ) // only uppercase letters at start or after whitespace, ignore punctuation boundaries
    : ''

/**
 * Display name of a location area. The " Area" suffix tells the reader this is
 * wider than a city and keeps it apart from a city of the same name — but a name
 * that already carries the word says it once: "York Region", not "York Region
 * Area". Listings and buildings carry the board's own area value ("York" where
 * the tree says "York Region"), so they read correctly through the same rule.
 */
export const formatAreaLabel = (area: string) =>
  /\b(region|county|district|area)$/i.test(area.trim())
    ? capitalize(area)
    : `${capitalize(area)} Area`

// Title-case any string, incl. ALL-CAPS input (e.g. "OAKWOOD PUBLIC SCHOOL"):
// lowercase first so `capitalize` can raise each word's initial letter.
export const titleCase = (str: Primitive) =>
  typeof str === 'string' ? capitalize(str.toLowerCase()) : ''

// Sentence case for UI labels: the first letter raised, the rest lowered.
export const sentenceCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

// "PatioAndPorchFeatures" → "Patio And Porch Features"
export const splitCamelCase = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, '$1 $2')

// "Advanced filters" → "Advanced"
export const firstWord = (str: string) => str.split(' ')[0]

// [before, match, after] around the first case-insensitive `query` in `text`, or null
export const splitOnMatch = (text: string, query: string) => {
  const start = text.toLowerCase().indexOf(query.toLowerCase())
  if (start < 0) return null
  const end = start + query.length
  return [text.slice(0, start), text.slice(start, end), text.slice(end)]
}

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
  return word!.replace(
    '$',
    Number.isFinite(count)
      ? formatEnglishNumber(count)
      : count === Infinity || count === -Infinity
        ? '∞'
        : 'NaN'
  )
}

export const notNA = (str: string) => str && str !== listingsConfig.notAvailable

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
  s = s.replace(/\s+(.)/g, function (_match, group1) {
    return group1.toUpperCase()
  })
  s = s.replace(/\s/g, '')
  return s
}

export const arrayFromString = (str: string | string[] | undefined) => {
  if (!str || typeof str !== 'string') return undefined
  try {
    return JSON.parse(str)
  } catch {
    return undefined
  }
}
