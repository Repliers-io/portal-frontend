import { useEffect, useState } from 'react'

import { type ChartStatsParams, fetchStatistics } from '@shared/Stats'

export const useChartData = (params: ChartStatsParams) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    // A response that lands after the params changed is stale — drop it.
    let current = true

    setData(null)
    setLoading(true)
    fetchStatistics('med-soldPrice,med-daysOnMarket,grp-mth', params).then(
      (result) => {
        if (!current) return
        setData(result)
        setLoading(false)
      }
    )

    return () => {
      current = false
    }
  }, [JSON.stringify(params)])

  return {
    data,
    loading
  }
}
