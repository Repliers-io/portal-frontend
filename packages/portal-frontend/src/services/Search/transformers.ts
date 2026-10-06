import dayjs from 'dayjs'

import filtersConfig, {
  type ListingStatus,
  type ListingType
} from '@configs/filters'

import { type Primitive } from 'utils/formatters'

import { optionalTransformers, simpleTransformers } from './declarations'
import { listingTypeDeclaration } from './listingTypeDeclaration'
import {
  type DaysOnMarket,
  type OpenHouseOption,
  type SoldWithin,
  type TransformOptions
} from './types'
import { deepExtend } from './utils'

const { listingStatusDeclaration } = filtersConfig

type TransformerFunction = (value: any, options?: TransformOptions) => any

export type SimpleKeys = keyof typeof simpleTransformers

export const simpleEffect = (key: SimpleKeys, value: Primitive) => {
  return simpleTransformers[key](value)
}

// WARN: Better ask chatGPT to explain those type definitions and generics
type OptionalTransformers = typeof optionalTransformers
type Option<K extends keyof OptionalTransformers> =
  keyof OptionalTransformers[K]

type EffectFunc = (arg: unknown) => object

export const optionalEffect = <
  K extends keyof OptionalTransformers,
  O extends Option<K>
>(
  key: K,
  options: O | O[],
  value: unknown = undefined
) => {
  if (Array.isArray(options)) {
    return options.reduce((acc, opt) => {
      const result =
        (optionalTransformers[key][opt] as EffectFunc)?.(value) || undefined
      return deepExtend(acc, result)
    }, {})
  } else {
    return (optionalTransformers[key][options] as EffectFunc)(value)
  }
}

type RangeEffectFunc = (date: dayjs.Dayjs, options?: TransformOptions) => object

export const rangeEffect = (
  key: 'soldRange' | 'activeRange' | 'cancelledRange',
  v: string | string[],
  options?: TransformOptions
) => {
  const value = Array.isArray(v) ? v[0] : v
  if (!value) return {}
  return (
    (optionalTransformers[key] as Record<string, RangeEffectFunc>)[value]?.(
      dayjs(),
      options
    ) ?? {}
  )
}

/**
 * Build a query fragment from a declaration: merge the fragments of the selected
 * keys into one object. Array fields union+de-dupe via `deepExtend`; agreeing
 * scalars stay scalar. Generic across declarations (listingStatus, listingType).
 * Exported for tests.
 */
export const buildDeclarationQuery = (
  selected: string | string[],
  declaration: Record<string, Record<string, unknown>>
): Record<string, unknown> => {
  const keys = (Array.isArray(selected) ? selected : [selected]).filter(Boolean)
  return keys.reduce<Record<string, unknown>>(
    (acc, key) => deepExtend(acc, declaration[key] ?? {}),
    {}
  )
}

export const transformers: Record<string, TransformerFunction> = {
  minPrice: (v: string) => simpleEffect('minPrice', v),
  maxPrice: (v: string) => simpleEffect('maxPrice', v),
  minBedrooms: (v: string) => simpleEffect('minBedrooms', v),
  minBaths: (v: string) => simpleEffect('minBaths', v),
  minGarageSpaces: (v: string) => simpleEffect('minGarageSpaces', v),
  minParkingSpaces: (v: string) => simpleEffect('minParkingSpaces', v),
  minYearBuilt: (v: string) => simpleEffect('minYearBuilt', v),
  maxYearBuilt: (v: string) => simpleEffect('maxYearBuilt', v),
  maxMaintenanceFee: (v: string) => simpleEffect('maxMaintenanceFee', v),
  minLotSizeSqft: (v: string) => simpleEffect('minLotSizeSqft', v),
  maxLotSizeSqft: (v: string) => simpleEffect('maxLotSizeSqft', v),
  minLotWidth: (v: string) => simpleEffect('minLotWidth', v),
  maxLotWidth: (v: string) => simpleEffect('maxLotWidth', v),
  minSqft: (v: string) => simpleEffect('minSqft', v),
  maxSqft: (v: string) => simpleEffect('maxSqft', v),
  openHouse: (v: OpenHouseOption | boolean | undefined) => {
    if (!v) return {}
    return optionalEffect(
      'openHouse',
      // WARN: needed as we use openHouse=true as a shortcut for openHouse=any for some tenants
      v === true ? 'any' : (v as OpenHouseOption),
      dayjs()
    )
  },

  soldWithin: (o: SoldWithin) => optionalEffect('soldWithin', o, dayjs()),
  daysOnMarket: (o: DaysOnMarket) => optionalEffect('daysOnMarket', o, dayjs()),
  listingStatus: (o: ListingStatus | ListingStatus[]) =>
    buildDeclarationQuery(o, listingStatusDeclaration),
  listingType: (o: ListingType | ListingType[]) =>
    buildDeclarationQuery(o, listingTypeDeclaration),
  soldRange: (v: string | string[], options?: TransformOptions) =>
    rangeEffect('soldRange', v, options),
  activeRange: (v: string | string[]) => rangeEffect('activeRange', v),
  cancelledRange: (v: string | string[]) => rangeEffect('cancelledRange', v)
}

export type Transformers = keyof typeof transformers
