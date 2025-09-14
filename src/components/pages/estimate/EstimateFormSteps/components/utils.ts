import { capitalize } from 'utils/strings'

export const sanitizeString = (value: string | number | null | undefined) =>
  String(value).trim().toLowerCase()

export const sanitizeArr = (arr: string[]) =>
  arr.map((item) => sanitizeString(item)).filter(Boolean)

export const renderValue = (
  selected: any,
  items: string[],
  multiple = false
) => {
  const sanitizedItems = sanitizeArr(items)
  const value =
    multiple && Array.isArray(selected)
      ? sanitizeArr(
          selected.filter((sel: string) =>
            sanitizedItems.includes(sel)
          ) as string[]
        ).join(', ') || ''
      : sanitizedItems.includes(selected)
        ? selected
        : ''

  return capitalize(value)
}
