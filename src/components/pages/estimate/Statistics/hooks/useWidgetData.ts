import { useEffect, useState } from 'react'

import { type StatsParams } from '@shared/Stats'

import { APIWidgets } from 'services/API'

import { dates, defaultWidgetData } from '../constants'
import { toWidgetsData, type WidgetsData } from '../utils'

export const useWidgetData = (params: StatsParams) => {
  const { propertyClass } = params
  const [loading, setLoading] = useState(false)
  const [widgets, setWidgets] = useState<WidgetsData>(defaultWidgetData)
  const [inventory, setInventory] = useState(0)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (!propertyClass) return

      const response = await APIWidgets.fetchStats(params)
      const widgetsData = toWidgetsData(response)
      setWidgets(widgetsData)

      // NOTE: we should ALWAYS take the previous (full) month of sold listings to calculate the inventory
      const sold = response.widgets?.sold?.count?.mth?.[dates[1]]?.value || 0
      const active = response.widgets?.active?.count?.value || 0

      setInventory(+(sold > 0 ? active / sold : 0)) // avoid division by zero
    } catch (error) {
      console.error('Metrics::Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(params)]) // re-fetch data when params change

  return {
    widgets,
    inventory,
    loading
  }
}
