import { type ApiClass } from './common'
import { type ApiStatisticRecord } from './search'

type AutocompleteViewTypeRecent = 'RECENT'
type AutocompleteViewTypeSearch = 'SEARCH'
export type AutocompleteViewType =
  | AutocompleteViewTypeRecent
  | AutocompleteViewTypeSearch

type PeriodValue = {
  value: number
}

type StatisticAvgMed = Pick<ApiStatisticRecord, 'avg' | 'med'>

interface PeriodBase<T> {
  month: T
  threeMonth: T
  year: T
}

interface MonthlyRecord<T> {
  [month: string]: T
}

type VolumePeriod = PeriodBase<PeriodValue> & {
  mth: MonthlyRecord<PeriodValue>
}
type StatisticPeriod = PeriodBase<StatisticAvgMed> & {
  mth: MonthlyRecord<StatisticAvgMed>
}
type CountPeriod = PeriodBase<PeriodValue> & {
  mth: MonthlyRecord<PeriodValue>
}

export interface ApiWidgetStatistics {
  sold: {
    prices: StatisticPeriod
    volume: VolumePeriod
    count: CountPeriod
    dom: StatisticPeriod
  }
  active: {
    count: PeriodValue
  }
  new: {
    count: {
      mth: MonthlyRecord<PeriodValue>
    }
  }
}

export interface ApiStatisticResponse {
  city: string
  neighborhood?: string
  community?: string
  class: ApiClass
  widgets: ApiWidgetStatistics
}
