/**
 * Fetches and holds the select-field option lists for the estimate form, sourced from
 * listing aggregates (filtered by min count, remapped to form field names). Exposes
 * `useSelectOptions`.
 * Anatomy: docs → product-guide/estimate/technical
 */
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import estimateConfig from '@configs/estimate'
import filtersConfig from '@configs/filters'

const { apiFields, apiFieldsRawMappings, selectOptionsParams } = estimateConfig
const { statusFilters } = filtersConfig

import { APISearch } from 'services/API'
import { rankOptions } from 'utils/filters'
import { logError } from 'utils/log'

type SelectOptionsContextType = {
  fields: string[]
  loading: boolean
  options: Record<string, string[]>
}

const SelectOptionsContext = createContext<SelectOptionsContextType | null>(
  null
)

const SelectOptionsProvider = ({
  minCount = 10,
  lazy = false,
  children
}: {
  minCount?: number
  lazy?: boolean
  children: React.ReactNode
}) => {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<Record<string, string[]>>({})

  const fetchOptions = async (fieldNames: readonly string[]) => {
    let counts: Record<string, Record<string, number>> = {}

    try {
      counts = await APISearch.fetchAggregates(fieldNames, {
        class: ['condo', 'residential'],
        ...statusFilters.active,
        ...selectOptionsParams
      })
    } catch (error) {
      logError('No field options provided from API', error)
    }

    return Object.fromEntries(
      fieldNames.map((path) => [
        path,
        rankOptions(counts[path] ?? {}, { sort: 'popularity', minCount })
      ])
    )
  }

  const applyMappings = (options: Record<string, string[]>) => {
    return Object.entries(options).reduce(
      (acc, [key, value]) => {
        const mappedKey = (apiFieldsRawMappings[
          key as keyof typeof apiFieldsRawMappings
        ] || key) as string
        acc[mappedKey] = value
        return acc
      },
      {} as Record<string, string[]>
    )
  }

  useEffect(() => {
    if (lazy) return
    const startFetch = async () => {
      setLoading(true)
      try {
        const options = await fetchOptions(apiFields)
        const mappedOptions = applyMappings(options)
        setOptions(mappedOptions)
      } catch (error) {
        logError('[SelectOptions] error fetching data', error)
      } finally {
        setLoading(false)
      }
    }

    startFetch()
  }, [lazy])

  const contextValue = useMemo(
    () => ({ fields: apiFields, options, loading }),
    [options, loading]
  )

  return (
    <SelectOptionsContext.Provider value={contextValue}>
      {children}
    </SelectOptionsContext.Provider>
  )
}

export default SelectOptionsProvider

export const useSelectOptions = () => {
  const context = useContext(SelectOptionsContext)
  if (!context) {
    throw Error('useSelectOptions must be used within a SelectOptionsProvider')
  }
  return context
}
