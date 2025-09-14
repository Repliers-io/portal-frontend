import { toSafeNumber } from './formatters'

// NOTE: https://poe.com/p/What-is-the-symbol-used-to-represent-inches-in-writing

export const parseFootInch = (sqft: string) => {
  const regex = /(\d+)['′’`]\s*(\d+)["″”]?/
  const matches = String(sqft).match(regex)
  if (!matches) return 0

  const feet = toSafeNumber(matches[1])
  const inches = toSafeNumber(matches[2])

  return feet * 12 + inches // Convert to total inches
}

export const multiplySqft = (sqft1: string, sqft2: string) => {
  const sqft1Inches = parseFootInch(sqft1)
  const sqft2Inches = parseFootInch(sqft2)

  const inches = sqft1Inches * sqft2Inches

  // There are 144 square inches in a square foot
  const feet = Math.floor(inches / 144)
  const remainingInches = inches % 144

  return {
    feet,
    inches,
    remainingInches,
    string: `${feet}′${remainingInches}″`
  }
}

export const SQFT_PER_ACRE = 43560

/**
 * @description calculate the area in acres (imperial)
 * @param length Feet
 * @param width Feet
 * @returns Acres
 */
export const calcAreaAcres = (length: number, width: number) =>
  length && width ? ((length * width) / SQFT_PER_ACRE).toFixed(4) : ''

/**
 * @description  Given any two of width (ft), depth (ft), acres — calculates the third. Returns all three values (acres rounded to 4dp).
 */
export function deriveArea(
  width?: number,
  depth?: number,
  acres?: number,
  sqft?: number
): [
  width: number | null,
  depth: number | null,
  acres: number | null,
  sqft: number | null
] {
  if (acres && !sqft) {
    // eslint-disable-next-line no-param-reassign
    sqft = acres * SQFT_PER_ACRE
  }
  if (sqft) {
    // replace acres value by calculated acres
    // eslint-disable-next-line no-param-reassign
    acres = Number(sqft / SQFT_PER_ACRE)
  }

  // width & depth → acres
  if (width && depth) {
    return [width, depth, Number(calcAreaAcres(width, depth)), width * depth]
  }
  // width & acres → depth
  if (width && acres && !depth) {
    return [
      width,
      Math.round((acres * SQFT_PER_ACRE) / width),
      acres,
      acres * SQFT_PER_ACRE
    ]
  }
  // depth & acres → width
  if (depth && acres && !width) {
    return [
      Math.round((acres * SQFT_PER_ACRE) / depth),
      depth,
      acres,
      acres * SQFT_PER_ACRE
    ]
  }

  return [width || null, depth || null, acres || null, sqft || null]
}

export const parseYearRange = (value: string): number => {
  const [, end] = value.split('-')
  return end ? toSafeNumber(end) : toSafeNumber(value)
}
