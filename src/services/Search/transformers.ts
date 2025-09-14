import dayjs from 'dayjs'

import { type ListingStatus, type ListingType } from '@configs/filters'

import { type Primitive } from 'utils/formatters'

import { optionalTransformers, simpleTransformers } from './declarations'
import { type DaysOnMarket, type SoldWithin } from './types'
import { deepExtend } from './utils'

type TransformerFunction = (value: any) => any

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

export const transformers: Record<string, TransformerFunction> = {
  minPrice: (v: string) => simpleEffect('minPrice', v),
  maxPrice: (v: string) => simpleEffect('maxPrice', v),
  minBeds: (v: string) => simpleEffect('minBeds', v),
  minBaths: (v: string) => simpleEffect('minBaths', v),
  minGarageSpaces: (v: string) => simpleEffect('minGarageSpaces', v),
  minParkingSpaces: (v: string) => simpleEffect('minParkingSpaces', v),
  minYearBuilt: (v: string) => simpleEffect('minYearBuilt', v),
  maxYearBuilt: (v: string) => simpleEffect('maxYearBuilt', v),

  soldWithin: (o: SoldWithin) => optionalEffect('soldWithin', o, dayjs()),
  daysOnMarket: (o: DaysOnMarket) => optionalEffect('daysOnMarket', o, dayjs()),
  listingStatus: (o: ListingStatus) => optionalEffect('listingStatus', o),
  listingType: (o: ListingType) => optionalEffect('listingType', o)
}

export type Transformers = keyof typeof transformers
