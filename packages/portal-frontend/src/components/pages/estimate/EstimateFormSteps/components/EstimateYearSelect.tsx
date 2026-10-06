import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { parseYearRange } from 'utils/numbers'
import { capitalize } from 'utils/strings'

import EstimateSelect from './EstimateSelect'

const EstimateYearSelect = ({
  items,
  loading,
  ...rest
}: {
  items: any[]
  loading: boolean
}) => {
  const t = useTranslations('MapFilters')

  const { yearFormat, sortedItems } = useMemo(() => {
    const yearFormat =
      items?.some((item: string) => Number(item) > 1900) ?? false

    const sortedItems: string[] = !items?.length
      ? []
      : yearFormat
        ? [...items]
            .filter((item: string) => Number(item) > 1900)
            .sort((a: string, b: string) => Number(b) - Number(a))
        : [...items].sort((a: string, b: string) => {
            if (a === '' && b !== '') return -1
            if (b === '' && a !== '') return 1
            return parseYearRange(a) - parseYearRange(b)
          })

    return { yearFormat, sortedItems }
  }, [items])

  return (
    <EstimateSelect
      label={t('yearBuilt')}
      items={sortedItems}
      loading={loading}
      {...rest}
      renderValue={(v: string) => {
        if (yearFormat) return v.match(/[0-9]/) ? v : <>&nbsp;</>
        return v.match(/[0-9]/) ? `${v} years` : v ? capitalize(v) : <>&nbsp;</>
      }}
    />
  )
}

export default EstimateYearSelect
