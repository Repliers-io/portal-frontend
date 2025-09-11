'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import queryString from 'query-string'

import {
  apiFields,
  apiFieldsRawMappings,
  selectOptionsParams
} from '@configs/estimate'

import { APIBase } from 'services/API'
import { getPath } from 'utils/path'

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
  children
}: {
  minCount?: number
  children: React.ReactNode
}) => {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<Record<string, string[]>>({})

  const fetchOptions = async <K extends string>(
    fieldNames: readonly K[]
  ): Promise<Record<K, string[]>> => {
    const query = queryString.stringify({
      aggregates: fieldNames.join(','),
      class: ['condo', 'residential'],
      listings: 'false',
      status: ['A'],
      ...selectOptionsParams
    })
    const endpoint = `/listings/search?${query}`

    let aggregates: Record<string, any> = {}
    const result: Record<K, string[]> = {} as Record<K, string[]>

    try {
      const response = await new APIBase().fetchJSON<any>(endpoint)
      aggregates = response.aggregates
    } catch (error) {
      console.error('No field options provided from API', error)
    }

    fieldNames.forEach((path) => {
      const value = getPath(aggregates, path) || {}
      const entries = Object.entries(value).sort(
        (a: [string, any], b: [string, any]) => (a[0] === '' ? -1 : b[1] - a[1])
      )
      // drop options with count less than minCount
      const filteredEntries = entries.filter(
        ([, count]) => (count as number) >= minCount
      )
      // add at least one empty option
      // and make sure there are no duplicates
      result[path] = Array.from(
        new Set([...filteredEntries.map(([name]) => name)])
      ).map((v) => v.toLowerCase())
    })
    return result
  }

  function splitUniqueOptions(options: string[]): string[] {
    const uniqueOptions = new Set<string>()
    options.forEach((option) => {
      option.split(',').forEach((parsedOption) => {
        const trimmedOption = parsedOption.trim()
        if (trimmedOption === '') return
        uniqueOptions.add(trimmedOption)
      })
    })
    return Array.from(uniqueOptions)
  }

  const applyMappings = (options: Record<string, string[]>) => {
    return Object.entries(options).reduce(
      (acc, [key, value]) => {
        const mappedKey = (apiFieldsRawMappings[
          key as keyof typeof apiFieldsRawMappings
        ] || key) as string
        acc[mappedKey] = splitUniqueOptions(value)
        return acc
      },
      {} as Record<string, string[]>
    )
  }

  useEffect(() => {
    const startFetch = async () => {
      setLoading(true)
      try {
        const options = await fetchOptions(apiFields)
        const mappedOptions = applyMappings(options)
        setOptions(mappedOptions)
      } catch (error) {
        console.error('[SelectOptions] error fetching data', error)
      } finally {
        setLoading(false)
      }
    }

    startFetch()
  }, [])

  const contextValue = useMemo(
    () => ({ fields: apiFields, options, loading }),
    [apiFields, options, loading]
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
