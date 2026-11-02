'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { chartColors } from '@configs/colors'
import { type PropertyClass } from '@configs/filters'
import {
  type ChartAction,
  type ChartTimeRange,
  fetchDaysOnMarket,
  fetchSalePrice,
  fetchSalesVolume,
  fetchSold,
  getActionLabel
} from '@shared/Stats'

import useIntersectionObserver from 'hooks/useIntersectionObserver'

import {
  ChartActionButtons,
  ChartBulletList,
  ChartRangeSelect,
  ChartTitle,
  GraphContainer,
  NotEnoughData
} from './components'
import { StatsChart } from './StatsChart'

export const StatsGraph = ({
  area,
  city = '',
  propertyClass
}: {
  area?: string
  city?: string | string[]
  propertyClass: PropertyClass
}) => {
  const t = useTranslations()
  const [visible, ref] = useIntersectionObserver(0)
  const [timeRange, setTimeRange] = useState<ChartTimeRange>(12)
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<ChartAction>('salePrice')
  const [loadedAction, setLoadedAction] = useState<ChartAction | null>(null)
  const [chartData, setChartData] = useState<Record<string, unknown>[] | null>(
    null
  )

  const twoLines = ['salePrice', 'daysOnMarket'].includes(action)

  const labels = twoLines
    ? [t('Charts.average'), t('Charts.median')]
    : [getActionLabel(action, propertyClass, t)]

  useEffect(() => {
    if (!visible) return

    // A response that lands after the action/params changed belongs to the
    // previous chart — drop it.
    let current = true

    const fetchChartData = async () => {
      const propertyClassArray = (
        propertyClass === 'all' ? ['residential', 'condo'] : [propertyClass]
      ) as PropertyClass[]
      const params = {
        area,
        city,
        timeRange,
        propertyClass: propertyClassArray
      }

      const fetchMap: Record<ChartAction, typeof fetchSalePrice> = {
        sold: fetchSold,
        volume: fetchSalesVolume,
        salePrice: fetchSalePrice,
        daysOnMarket: fetchDaysOnMarket
      }

      const fetchFunction = fetchMap[action] || fetchSalePrice

      try {
        setLoading(true)
        const data = await fetchFunction(params)
        if (!current) return
        setChartData(data)
        setLoadedAction(action)
      } catch (error) {
        console.error('[StatsGraph] error fetching data:', error)
      } finally {
        if (current) setLoading(false)
      }
    }

    fetchChartData()

    return () => {
      current = false
    }
  }, [visible, action, propertyClass, area, city, timeRange])

  return (
    <GraphContainer
      ref={ref}
      loading={!loadedAction}
      titleSlot={
        <ChartTitle
          action={action}
          loading={loading}
          propertyClass={propertyClass}
        />
      }
      buttonsSlot={
        <ChartActionButtons
          action={action}
          setAction={setAction}
          propertyClass={propertyClass}
        />
      }
      timeRangeSlot={
        <ChartRangeSelect
          value={timeRange}
          onChange={(value) => setTimeRange(value as ChartTimeRange)}
        />
      }
      bulletsSlot={<ChartBulletList labels={labels} colors={chartColors} />}
    >
      {chartData?.length ? (
        <StatsChart
          data={chartData}
          labels={labels}
          colors={chartColors}
          action={loadedAction}
        />
      ) : (
        <NotEnoughData />
      )}
    </GraphContainer>
  )
}
