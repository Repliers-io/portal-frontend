import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { chartColors } from '@configs/colors'
import { cityCardClasses } from '@configs/statistics'
import { fetchSalePrice } from '@shared/Stats/requests'

import { cityGeoFilters } from 'utils/filters'
import { formatEnglishPrice } from 'utils/formatters'

type SalePricePoint = { date: string; avg: number | null; med: number | null }

// Six months of sold prices behind a dashboard city card: the series,
// the last median, a y-domain padded 15% around the values and the tooltip labels.
export const useCitySalePrice = (city: string) => {
  const t = useTranslations()
  const [data, setData] = useState<SalePricePoint[] | null>(null)
  const [loading, setLoading] = useState(true)

  const tooltipLabels = useMemo(
    () => ({
      avg: {
        color: chartColors[1],
        label: t('Charts.average'),
        formatter: formatEnglishPrice
      },
      med: {
        color: chartColors[0],
        label: t('Charts.median'),
        formatter: formatEnglishPrice
      }
    }),
    [t]
  )

  useEffect(() => {
    fetchSalePrice(
      { ...cityGeoFilters(city), propertyClass: cityCardClasses, timeRange: 6 },
      true
    )
      .then((result) => setData(result as SalePricePoint[] | null))
      .finally(() => setLoading(false))
  }, [city])

  const lastMed = data?.at(-1)?.med ?? null

  const domain = useMemo(() => {
    if (!data) return undefined
    const values = data
      .flatMap((d) => [d.avg, d.med])
      .filter((v): v is number => v != null)
    if (values.length === 0) return undefined
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.15
    return [Math.max(0, min - padding), max + padding]
  }, [data])

  return { data, loading, lastMed, domain, tooltipLabels }
}
