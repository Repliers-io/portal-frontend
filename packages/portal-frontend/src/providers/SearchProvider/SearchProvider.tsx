/**
 * Scoped search state: filters, results, clusters, multi-units. Exposes two contexts —
 * `useSearch` (read-heavy: results/filters) and `useSearchActions` (stable writers) — so
 * filter writers don't re-render when results change.
 */
'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { type Position } from 'geojson'

import filtersConfig from '@configs/filters'

import { type ApiListing, type ApiQueryResponse } from 'services/API'
import SearchService, { type Filters, type MapPoint } from 'services/Search'

import {
  emptySavedResponse,
  mockSearchActions,
  mockSearchContext
} from './mock'
import {
  type SavedResponse,
  type SearchActionsType,
  type SearchContextType
} from './types'

const { defaultFilters } = filtersConfig

// A geo-filter value counts as set when it is a non-empty string or array.
const filled = (value?: string | string[]) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value)

const SearchContext = createContext<SearchContextType | undefined>(undefined)
const SearchActionsContext = createContext<SearchActionsType | undefined>(
  undefined
)

const SearchProvider = ({
  filters,
  polygon,
  region,
  point,
  children
}: {
  filters?: Filters
  polygon?: Position[]
  /** Multi-polygon region of a loaded saved search — see the rationale at the
   *  `searchRegion` state declaration below. */
  region?: Position[][]
  point?: MapPoint
  children?: React.ReactNode
}) => {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<SavedResponse>(emptySavedResponse)
  const [multiUnits, saveMultiUnits] = useState<ApiListing[]>([])
  const [cachedListing, saveCachedListing] = useState<ApiListing | null>(null)

  const [searchFilters, setSearchFilters] = useState(filters || defaultFilters)

  // Wrapper that always merges with defaultFilters
  const setFilters = (newFilters: Partial<Filters>) =>
    setSearchFilters({ ...defaultFilters, ...newFilters })

  const [searchPolygon, setPolygon] = useState<Position[] | null>(
    polygon || null
  )

  // Loaded saved-search region (multi-ring `map`). Deliberately a SEPARATE
  // field, not a widening of `polygon` — the two carry different contracts:
  // - `polygon` is the draw tool's state: exactly ONE ring, editable
  //   (setEditMode('draw')), small enough to serialize into the URL on every
  //   push. All pre-existing saved searches are single-ring and keep loading
  //   through it, staying editable.
  // - `region` is N independent rings (merged location boundaries): the
  //   one-ring draw editor can't represent it, and it's far beyond URL size
  //   limits — so it survives filter changes but not a reload, same
  //   degradation as the saved-search title.
  // Widening `polygon` into a union would push array-depth sniffing into the
  // draw editor, the URL sync and every consumer, for a state with a different
  // lifecycle. Read-only: no setter beyond the initial prop — replaced by
  // drawing/selecting, dropped together with the polygon by clearPolygon.
  const [searchRegion, setRegion] = useState<Position[][] | null>(
    region || null
  )

  const [searchPoint, setPoint] = useState<MapPoint | null>(point || null)

  const setFilter = (key: keyof Filters, value: any) =>
    setSearchFilters((prev) => ({ ...prev, [key]: value }))

  // Stable identity (functional setState, no deps) so the dedicated actions
  // context never changes — writers can mutate filters without subscribing to,
  // and re-rendering on, every `filters`/`listings` change.
  const addFilters = useCallback(
    (newFilters: Filters) =>
      setSearchFilters((prev) => ({ ...prev, ...newFilters })),
    []
  )

  const removeFilter = (key: keyof Filters) =>
    setSearchFilters((prev) => {
      const { [key]: _, ...rest } = prev
      return rest
    })

  const removeFilters = useCallback(
    (keys: (keyof Filters)[]) =>
      setSearchFilters((prev) => {
        const newFilters = { ...prev }
        keys.forEach((key) => {
          delete newFilters[key]
        })
        return newFilters
      }),
    []
  )

  const clearPoint = useCallback(() => setPoint(null), [])

  // Clears the user-defined search region — both the drawn polygon and a
  // loaded saved-search region; every "clear the area" entry point means both.
  const clearPolygon = useCallback(() => {
    setPolygon(null)
    setRegion(null)
  }, [])

  const actionsValue = useMemo(
    () => ({ addFilters, removeFilters, setPoint, clearPoint, clearPolygon }),
    [addFilters, removeFilters, clearPoint, clearPolygon]
  )

  const resetFilters = () => setSearchFilters(defaultFilters)
  const clearGridCache = () => setSaved({ ...saved, page: 0 })

  const save = (response: ApiQueryResponse) => {
    setLoading(true)

    const { listings, count, page, numPages, aggregates, statistics } = response

    const remappedResponse: SavedResponse = {
      page,
      pages: numPages,
      count,
      statistics,
      listings,
      clusters: aggregates ? aggregates.map.clusters : []
    }

    setSaved(remappedResponse)
    return remappedResponse
  }

  const search = async (params: any, clearOnComplete = false) => {
    let response: ApiQueryResponse | null = null
    try {
      setLoading(true)
      response = await SearchService.fetch(params)
    } catch {
      // Handle error
    }
    // Grid-only fetches pass clearOnComplete=true because they never call save().
    // For map fetches, loading is cleared by the effect below after save() commits data.
    // Only clear when response is non-null: if aborted (null), a concurrent map fetch
    // is still in flight and its save() will clear loading instead.
    if (clearOnComplete && response) setLoading(false)
    return response
  }

  // special effect to clear up the grid and show loading placeholders
  // instead of "No Results" message
  useEffect(() => {
    if (filters?.imageSearchItems) setSaved({ ...saved, page: 0 })
  }, [filters])

  // saving the response object takes time, so we need to show loading and placeholders
  // instead of a flash of empty state between fetch completing and data rendering
  useEffect(() => setLoading(false), [saved])

  const filtersDisabled = searchFilters.source === 'featured'

  const contextValue = useMemo(
    () => ({
      loading,
      filtersDisabled,
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
      region: searchRegion,
      // A search polygon (drawn/loaded) and selected locations are mutually
      // exclusive; consumers block the conflicting control off these flags.
      polygonPresent: Boolean(searchPolygon || searchRegion?.length),
      locationsPresent:
        filled(searchFilters.locationId) ||
        filled(searchFilters.externalLocationId) ||
        filled(searchFilters.location),
      point: searchPoint,
      setPoint,
      clearPoint,
      multiUnits,
      saveMultiUnits,
      clearMultiUnits: () => saveMultiUnits([]),
      cachedListing,
      saveCachedListing,
      clearCachedListing: () => saveCachedListing(null),
      clearGridCache
    }),
    [
      searchFilters,
      searchPolygon,
      searchRegion,
      searchPoint,
      loading,
      saved,
      multiUnits,
      cachedListing
    ]
  )

  return (
    <SearchActionsContext.Provider value={actionsValue}>
      <SearchContext.Provider value={contextValue}>
        {children}
      </SearchContext.Provider>
    </SearchActionsContext.Provider>
  )
}
export default SearchProvider

export const useSearch = () => useContext(SearchContext) ?? mockSearchContext

/**
 * Subscribe to only the stable filter-mutation actions (`addFilters`/
 * `removeFilters`) without re-rendering on `filters`/`listings` changes.
 */
export const useSearchActions = () =>
  useContext(SearchActionsContext) ?? mockSearchActions
