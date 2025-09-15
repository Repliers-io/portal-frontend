import type dayjs from 'dayjs'
import { type ManipulateType } from 'dayjs'

import i18nConfig from '@configs/i18n'

import { type Primitive } from 'utils/formatters'

import { type SimpleKeys } from './transformers'

export const formatPastDate = (
  date: dayjs.Dayjs,
  value: number,
  type: ManipulateType
) => date.subtract(value, type).format(i18nConfig.dateFormat)

// not sure we need to keep our own implementation,
// there are many libraries for that
export const deepExtend = (
  target: { [x: string]: unknown },
  ...sources: object[]
) => {
  for (const source of sources) {
    for (const [key, value] of Object.entries(source ?? {})) {
      if (Array.isArray(value)) {
        target[key] = (Array.isArray(target[key]) ? target[key] : []).concat(
          value
        )
      } else {
        target[key] = value
      }
    }
  }
  return target
}

export const nonZeroValue = (key: SimpleKeys, value: Primitive) => {
  const parsedValue = Number(value)
  return !parsedValue ? {} : { [key]: parsedValue }
}
