'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Box } from '@mui/material'

import gridConfig from '@configs/cards-grids'
import { type PropertyClass } from '@defaults/filters'
import { ArrayWidget, BarsWidget, CountWidget } from '@shared/Widgets'
import calendarImg from 'assets/common/calendar.svg'
import houseImg from 'assets/common/house.svg'
import salesImg from 'assets/common/sales.svg'

import { type ApiStatisticResponse, APIWidgets } from 'services/API'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { formatPrice, toSafeString } from 'utils/formatters'

import { type StatsParams } from '.'

const extractValuesArray = (obj: any) =>
  obj && Object.keys(obj).map((key) => obj[key]?.value)
const extractValuesObject = (obj: any) =>
  obj && Object.keys(obj).map((key) => obj[key])

type StatsTabPanelProps = StatsParams & {
  label?: string
}

export const StatsTabPanel = ({
  city,
  neighborhood,
  propertyClass,
  label
}: StatsTabPanelProps) => {
  const t = useTranslations('Charts')
  const [stats, setStats] = useState<ApiStatisticResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [visible, ref] = useIntersectionObserver()

  const active = stats?.widgets?.active
  const sold = stats?.widgets?.sold

  const activeCount = active?.count?.value
  const soldCounts = extractValuesArray(sold?.count || false)
  const volumes = extractValuesArray(sold?.volume || false)
  const daysOnMarket =
    sold?.dom && extractValuesObject(sold.dom).map((item: any) => item?.avg)
  const prices = extractValuesObject(sold?.prices || false)

  const fetchData = async () => {
    try {
      if (!propertyClass) return

      setLoading(true)
      const propertyClassArray = (
        propertyClass === 'all' ? ['residential', 'condo'] : [propertyClass]
      ) as PropertyClass[]

      const response = await APIWidgets.fetchStats({
        city,
        neighborhood,
        propertyClass: propertyClassArray
      })
      setStats(response)
    } catch (error) {
      console.error('[StatsTabPanel] error fetching data', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible && !stats && !loading) fetchData()
  }, [visible, loading, stats])

  return (
    <Box
      ref={ref}
      display="grid"
      gridTemplateColumns={{ sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
      gap={gridConfig.widgetSpacing}
      sx={{
        '& > *': {
          height: '220px'
        }
      }}
    >
      <Box gridColumn="span 1" order="1">
        <CountWidget
          index={0} // no delay
          icon={houseImg}
          data={activeCount}
          title={`${label} For Sale`}
        />
      </Box>
      <Box gridColumn="span 1" order={{ xs: 3, sm: 5, md: 2 }}>
        <ArrayWidget
          index={1} // 100ms delay
          icon={houseImg}
          data={soldCounts}
          title={`${label} Sold`}
          formatter={(value) => toSafeString(value)}
        />
      </Box>
      <Box
        gridColumn="span 1"
        gridRow="span 2"
        order={{ xs: 5, sm: 4, md: 3 }}
        sx={{ height: '472px' }}
      >
        <BarsWidget
          // no `index` given, BarsWidget controls bars visibility by itself
          icon={houseImg}
          data={prices}
          title="Sales Price"
        />
      </Box>
      <Box gridColumn="span 1" order={{ xs: 2, sm: 3, md: 4 }}>
        <ArrayWidget
          index={2} // 200ms delay
          icon={calendarImg}
          data={daysOnMarket}
          title={t('averageDaysOnMarket')}
        />
      </Box>
      <Box gridColumn="span 1" order={{ xs: 4, sm: 2, md: 4 }}>
        <ArrayWidget
          index={3} // 300ms delay
          data={volumes}
          icon={salesImg}
          title="Sales Volume"
          formatter={(v) => formatPrice(v)}
        />
      </Box>
    </Box>
  )
}
