import queryString from 'query-string'

import { type StatsParams } from '@shared/Stats'

import { APIBase } from './APIBase'
import { type ApiStatisticResponse } from './types'

class APIWidgetsClass extends APIBase {
  fetchStats({
    area = '',
    city = '',
    neighborhood = '',
    propertyClass = 'residential',
    historyMonthsCount = 4
  }: StatsParams & { historyMonthsCount?: number }) {
    const params = queryString.stringify(
      {
        area,
        city,
        neighborhood,
        class: propertyClass,
        historyMonthsCount
      },
      {
        skipEmptyString: true,
        skipNull: true
      }
    )

    return this.fetchJSON(
      `/stats/widgets?${params}`
    ) as Promise<ApiStatisticResponse>
  }
}

export const APIWidgets = new APIWidgetsClass()
