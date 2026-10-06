import { useEffect, useMemo, useState } from 'react'

import filtersConfig from '@configs/filters'

import { APISearch } from 'services/API'
import { type RankOptions, rankOptions } from 'utils/filters'
import { logError } from 'utils/log'

const { sale, lease } = filtersConfig.rawFilters
const fields = [...new Set([...sale, ...lease])]

// Board-wide and unfiltered, so one request serves every draft, map position and
// dialog open of the page session.
let request: Promise<Record<string, Record<string, number>>> | null = null

const fetchCounts = () =>
  (request ??= APISearch.fetchAggregates(
    fields.map((field) => `raw.${field}`)
  ).catch((error) => {
    logError('[RawFilters] no raw field options', error)
    request = null
    return {}
  }))

// field → its option values; `null` until the counts arrive
export const useRawFilterOptions = ({ sort, minCount }: RankOptions = {}) => {
  const [counts, setCounts] = useState<Record<
    string,
    Record<string, number>
  > | null>(null)

  useEffect(() => {
    if (fields.length) fetchCounts().then(setCounts)
  }, [])

  return useMemo(
    () =>
      counts &&
      Object.fromEntries(
        fields.map((field) => [
          field,
          rankOptions(counts[`raw.${field}`] ?? {}, { sort, minCount })
        ])
      ),
    [counts, sort, minCount]
  )
}
