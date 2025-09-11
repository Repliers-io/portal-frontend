'use client'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { type Position } from 'geojson'

import { defaultFilters } from '@configs/filters'

import { type ApiQueryResponse, type Property } from 'services/API'
import SearchService, { type Filters } from 'services/Search'
import { sortPropertyScoredImages } from 'utils/properties'

import { type SavedResponse, type SearchContextType } from './types'

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const emptySavedResponse = {
  count: 0,
  page: 0,
  pages: 0,
  list: [],
  clusters: [],
  statistics: {}
}

const SearchProvider = ({
  filters,
  polygon,
  children
}: {
  filters?: Filters
  polygon?: Position[]
  children?: React.ReactNode
}) => {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<SavedResponse>(emptySavedResponse)
  const [multiUnits, saveMultiUnits] = useState<Property[]>([])

  const [searchFilters, setFilters] = useState(filters || defaultFilters)

  const [searchPolygon, setPolygon] = useState<Position[] | null>(
    polygon || null
  )

  const setFilter = (key: keyof Filters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const addFilters = (newFilters: Filters) =>
    setFilters((prev) => ({ ...prev, ...newFilters }))

  const removeFilter = (key: keyof Filters) =>
    setFilters((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = prev
      return rest
    })

  const removeFilters = (keys: (keyof Filters)[]) =>
    setFilters((prev) => {
      const newFilters = { ...prev }
      keys.forEach((key) => {
        delete newFilters[key]
      })
      return newFilters
    })

  const resetFilters = () => setFilters(defaultFilters)

  const clearPolygon = () => setPolygon(null)

  const save = (response: ApiQueryResponse) => {
    setLoading(true)

    const { listings, count, page, numPages, aggregates, statistics } = response

    const remappedResponse: SavedResponse = {
      page,
      pages: numPages,
      count,
      statistics,
      list: listings.map(sortPropertyScoredImages),
      clusters: aggregates ? aggregates.map.clusters : []
    }

    setSaved(remappedResponse)
    return remappedResponse
  }

  const search = async (params: any) => {
    let response
    try {
      setLoading(true)
      response = await SearchService.fetch(params)
    } finally {
      setLoading(false)
    }
    return response
  }

  // special effect to clear up the grid and show loading placeholders
  // instead of "No Results" message
  useEffect(() => {
    if (filters?.imageSearchItems) setSaved({ ...saved, page: 0 })
  }, [filters])

  // saving the response object takes time, so we need to show loading and placeholders
  useEffect(() => setLoading(false), [saved])

  const contextValue = useMemo(
    () => ({
      loading,
      filters: searchFilters,
      setFilter,
      setFilters,
      addFilters,
      removeFilter,
      removeFilters,
      resetFilters,
      search,
      save,
      ...saved, // destructured saved object shorthands
      polygon: searchPolygon,
      setPolygon,
      clearPolygon,
      multiUnits,
      saveMultiUnits,
      clearMultiUnits: () => saveMultiUnits([])
    }),
    [searchFilters, searchPolygon, loading, saved, multiUnits]
  )

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  )
}
export default SearchProvider

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw Error('useSearch must be used within an SearchProvider')
  }
  return context
}
