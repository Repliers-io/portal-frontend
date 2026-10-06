import { useEffect, useState } from 'react'

import { type StatsParams } from '@shared/Stats'

import { type ApiStatisticResponse, APIWidgets } from 'services/API'

import { toWidgetState } from '../utils'

export const useWidgetData = (
  params: StatsParams,
  ssrData?: ApiStatisticResponse | null
) => {
  const hasSsrData = ssrData != null

  const [state, setState] = useState(() => toWidgetState(ssrData ?? null))
  const [loading, setLoading] = useState(!hasSsrData)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (!params.propertyClass) return

      const response = await APIWidgets.fetchStats(params)
      setState(toWidgetState(response))
    } catch (error) {
      console.error('Metrics::Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasSsrData) return
    fetchData()
  }, [JSON.stringify(params)])

  return { ...state, loading }
}
