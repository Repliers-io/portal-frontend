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
  const sortedYearsItems =
    items?.sort((a: string, b: string) => {
      if (a === '' && b !== '') return -1
      if (b === '' && a !== '') return 1
      return parseYearRange(a) - parseYearRange(b)
    }) || []

  return (
    <EstimateSelect
      label="Property Age"
      items={sortedYearsItems}
      loading={loading}
      {...rest}
      renderValue={(v: string) =>
        v.match(/[0-9]/) ? `${v} years` : v ? capitalize(v) : <>&nbsp;</>
      }
    />
  )
}

export default EstimateYearSelect
