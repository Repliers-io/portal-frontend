import type dayjs from 'dayjs'

import filtersConfig from '@configs/filters'

import type {
  ActiveRangeKey,
  CancelledRangeKey,
  OptionalTransformers,
  SimpleTransformers,
  SoldRangeKey,
  TransformOptions
} from './types'
import { formatPastDate, nonZeroValue } from './utils'

const { statusFilters } = filtersConfig

type Duration = [number, Parameters<typeof formatPastDate>[2]]

const soldOrRentedFilter = (
  dates: { minSoldDate: string; maxSoldDate?: string },
  options?: TransformOptions
) => ({
  ...dates,
  ...statusFilters[options?.type === 'lease' ? 'leased' : 'sold']
})

const currentYear = new Date().getFullYear()
const yearKeys = Array.from({ length: 20 }, (_, i) => String(currentYear - i))

const soldRangeDurations: Record<SoldRangeKey, Duration> = {
  lastDay: [1, 'day'],
  last3d: [3, 'day'],
  lastWeek: [1, 'week'],
  last30d: [1, 'month'],
  last90d: [3, 'month'],
  last180d: [6, 'month'],
  lastYear: [1, 'year']
}

const cancelledRangeDurations: Record<CancelledRangeKey, Duration> = {
  lastDay: [1, 'day'],
  last3d: [3, 'day'],
  lastWeek: [1, 'week'],
  last30d: [1, 'month'],
  last90d: [3, 'month'],
  last180d: [6, 'month'],
  lastYear: [1, 'year']
}

const activeRangeDurations: Record<ActiveRangeKey, Duration> = {
  lastDay: [1, 'day'],
  last3d: [3, 'day'],
  lastWeek: [1, 'week'],
  last30d: [1, 'month'],
  last90d: [3, 'month'],
  moreThan15d: [15, 'day'],
  moreThan30d: [30, 'day'],
  moreThan60d: [60, 'day'],
  moreThan90d: [90, 'day']
}

export const simpleTransformers: SimpleTransformers = {
  minPrice: (v) => {
    const num = Number(v)
    return num == 0 ? { minPrice: 1 } : { minPrice: num } // should always be at least 1
  },
  maxPrice: (v) => nonZeroValue('maxPrice', v),
  minBedrooms: (v) => {
    const effect = nonZeroValue('minBedrooms', v)
    return effect.minBedrooms == -1 ? { minBedrooms: 1 } : effect // process -1 as Studio (1 Bed)
  },
  minBaths: (v) => nonZeroValue('minBaths', v),
  minGarageSpaces: (v) => nonZeroValue('minGarageSpaces', v),
  minParkingSpaces: (v) => nonZeroValue('minParkingSpaces', v),
  minYearBuilt: (v) => nonZeroValue('minYearBuilt', v),
  maxYearBuilt: (v) => nonZeroValue('maxYearBuilt', v),
  maxMaintenanceFee: (v) => nonZeroValue('maxMaintenanceFee', v),
  minLotSizeSqft: (v) => nonZeroValue('minLotSizeSqft', v),
  maxLotSizeSqft: (v) => nonZeroValue('maxLotSizeSqft', v),
  minLotWidth: (v) => nonZeroValue('minLotWidth', v),
  maxLotWidth: (v) => nonZeroValue('maxLotWidth', v),
  minSqft: (v) => nonZeroValue('minSqft', v),
  maxSqft: (v) => nonZeroValue('maxSqft', v)
}

export const optionalTransformers: OptionalTransformers = {
  daysOnMarket: {
    lastDay: (date) => ({ minListDate: formatPastDate(date, 1, 'day') }),
    lastWeek: (date) => ({ minListDate: formatPastDate(date, 1, 'week') }),
    lastMonth: (date) => ({ minListDate: formatPastDate(date, 1, 'month') }),
    last3Months: (date) => ({ minListDate: formatPastDate(date, 3, 'month') }),
    last6Months: (date) => ({ minListDate: formatPastDate(date, 6, 'month') }),
    lastYear: (date) => ({ minListDate: formatPastDate(date, 1, 'year') }),
    last2Years: (date) => ({ minListDate: formatPastDate(date, 2, 'year') }),
    any: () => ({})
  },
  soldWithin: {
    lastDay: (date) => ({ minSoldDate: formatPastDate(date, 1, 'day') }),
    lastWeek: (date) => ({ minSoldDate: formatPastDate(date, 1, 'week') }),
    lastMonth: (date) => ({ minSoldDate: formatPastDate(date, 1, 'month') }),
    last3Months: (date) => ({ minSoldDate: formatPastDate(date, 3, 'month') }),
    last6Months: (date) => ({ minSoldDate: formatPastDate(date, 6, 'month') }),
    lastYear: (date) => ({ minSoldDate: formatPastDate(date, 1, 'year') }),
    last2Years: (date) => ({ minSoldDate: formatPastDate(date, 2, 'year') }),
    any: () => ({})
  },
  openHouse: {
    today: (date) => {
      const d = date.format('YYYY-MM-DD')
      return { minOpenHouseDate: d, maxOpenHouseDate: d }
    },
    thisWeekend: (date) => {
      const day = date.day() // 0=Sun, 6=Sat
      const saturday =
        day === 0 ? date.subtract(1, 'day') : date.add(6 - day, 'day')
      const sunday = saturday.add(1, 'day')
      return {
        minOpenHouseDate: saturday.format('YYYY-MM-DD'),
        maxOpenHouseDate: sunday.format('YYYY-MM-DD')
      }
    },
    any: (date) => ({ minOpenHouseDate: date.format('YYYY-MM-DD') })
  },
  soldRange: Object.fromEntries([
    ...Object.entries(soldRangeDurations).map(([key, [amount, unit]]) => [
      key,
      (date: dayjs.Dayjs, options?: TransformOptions) =>
        soldOrRentedFilter(
          { minSoldDate: formatPastDate(date, amount, unit) },
          options
        )
    ]),
    ...yearKeys.map((year) => [
      year,
      (_date: dayjs.Dayjs, options?: TransformOptions) =>
        soldOrRentedFilter(
          { minSoldDate: `${year}-01-01`, maxSoldDate: `${year}-12-31` },
          options
        )
    ])
  ]) as OptionalTransformers['soldRange'],
  activeRange: Object.fromEntries(
    Object.entries(activeRangeDurations).map(([key, [amount, unit]]) => [
      key,
      (date: dayjs.Dayjs) => ({
        [key.startsWith('moreThan') ? 'maxListDate' : 'minListDate']:
          formatPastDate(date, amount, unit),
        ...statusFilters.activeRange
      })
    ])
  ) as unknown as OptionalTransformers['activeRange'],
  cancelledRange: Object.fromEntries([
    ...Object.entries(cancelledRangeDurations).map(([key, [amount, unit]]) => [
      key,
      (date: dayjs.Dayjs) => ({
        minUnavailableDate: formatPastDate(date, amount, unit),
        ...statusFilters.cancelled
      })
    ]),
    ...yearKeys.map((year) => [
      year,
      () => ({
        minUnavailableDate: `${year}-01-01`,
        maxUnavailableDate: `${year}-12-31`,
        ...statusFilters.cancelled
      })
    ])
  ]) as OptionalTransformers['cancelledRange']
}
