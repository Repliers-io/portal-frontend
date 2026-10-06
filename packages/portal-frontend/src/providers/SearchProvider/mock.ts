import filtersConfig from '@configs/filters'

import { type SearchActionsType, type SearchContextType } from './types'

export const emptySavedResponse = {
  count: 0,
  page: 0,
  pages: 0,
  listings: [],
  clusters: [],
  statistics: {}
}

const { defaultFilters } = filtersConfig

const noop = () => undefined

export const mockSearchContext: SearchContextType = {
  loading: false,
  filtersDisabled: false,

  filters: defaultFilters,
  setFilter: noop,
  setFilters: noop,
  addFilters: noop,
  removeFilter: noop,
  removeFilters: noop,
  resetFilters: noop,

  save: () => emptySavedResponse,
  search: () => Promise.resolve(null),

  count: 0,
  page: 0,
  pages: 0,
  listings: [],
  clusters: [],
  statistics: {},

  polygon: null,
  setPolygon: noop,
  clearPolygon: noop,
  region: null,
  polygonPresent: false,
  locationsPresent: false,

  point: null,
  setPoint: noop,
  clearPoint: noop,

  multiUnits: [],
  saveMultiUnits: noop,
  clearMultiUnits: noop,

  cachedListing: null,
  saveCachedListing: noop,
  clearCachedListing: noop,

  clearGridCache: noop
}

// Actions are a Pick<> subset of the context — reuse the context mock so the two
// stay in sync automatically. The context literal above is the single
// type-completeness tripwire for both.
export const mockSearchActions: SearchActionsType = mockSearchContext
