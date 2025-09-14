import { useEffect, useState } from 'react'

import { type ChartStatsParams, fetchStatistics } from '@shared/Stats'

export const useChartData = (params: ChartStatsParams) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any | null>(null)

  const fetchChartData = async () => {
    setLoading(true)
    try {
      const result = await fetchStatistics(
        'med-soldPrice,med-daysOnMarket,grp-mth',
        params
      )

      setData(result)
    } catch (error) {
      console.error(`Failed to load chart data: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setData(null)
    fetchChartData()
  }, [JSON.stringify(params)])

  return {
    data,
    loading
  }
}
