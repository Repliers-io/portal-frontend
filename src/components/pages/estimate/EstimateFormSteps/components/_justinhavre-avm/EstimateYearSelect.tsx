import EstimateSelect from '../EstimateSelect'

const EstimateYearSelect = ({
  items,
  loading,
  ...rest
}: {
  items: string[]
  loading: boolean
}) => {
  const sortedItems = items
    ?.sort((a: string, b: string) => Number(b) - Number(a))
    .filter((item: string) => Number(item) > 1900)

  return (
    <EstimateSelect
      label="Year Built"
      items={sortedItems}
      loading={loading}
      {...rest}
      renderValue={(v: string) => (v.match(/[0-9]/) ? v : <>&nbsp;</>)}
    />
  )
}

export default EstimateYearSelect
