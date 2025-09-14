import queryString from 'query-string'

import { type StatsParams } from '@shared/Stats'

import APIBase from './APIBase'
import { type ApiStatisticResponse } from './types'

class APIWidgets extends APIBase {
  fetchStats({
    area = '',
    city = '',
    neighborhood = '',
    propertyClass = 'residential'
  }: StatsParams) {
    const params = queryString.stringify(
      {
        area,
        city,
        neighborhood,
        class: propertyClass,
        historyMonthsCount: 4
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

const apiWidgetsInstance = new APIWidgets()
export default apiWidgetsInstance
