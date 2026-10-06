import type { Position } from 'geojson'

import {
  type ApiCluster,
  type ApiListing,
  type ApiQueryResponse
} from 'services/API'
import { type Filters, type MapPoint } from 'services/Search'

export type SavedResponse = {
  count: number
  page: number
  pages: number
  listings: ApiListing[]
  clusters: ApiCluster[]
  statistics: { [key: string]: any }
}

export type SearchContextType = SavedResponse & {
  loading: boolean
  filtersDisabled: boolean
  filters: Partial<Filters>
  setFilter: (key: keyof Filters, value: any) => void
  setFilters: (filters: Partial<Filters>) => void
  addFilters: (newFilters: Partial<Filters>) => void
  removeFilter: (key: keyof Filters) => void
  removeFilters: (keys: (keyof Filters)[]) => void
  resetFilters: () => void
  search: (
    params: any,
    clearOnComplete?: boolean
  ) => Promise<ApiQueryResponse | null>
  save: (response: ApiQueryResponse) => SavedResponse
  polygon: Position[] | null
  setPolygon: (polygon: Position[]) => void
  clearPolygon: () => void
  /** Multi-polygon region of a loaded saved search (read-only; cleared together
   *  with the drawn polygon by clearPolygon). Separate from `polygon` by design
   *  — see the rationale at the SearchProvider state declaration. */
  region: Position[][] | null
  /** A drawn or loaded search polygon is active (`polygon` or `region`). Mutually
   *  exclusive with `locationsPresent` — the draw/overlay controls use these two
   *  flags to block the conflicting action instead of silently clearing it. */
  polygonPresent: boolean
  /** One or more locations are selected (`locationId`, `externalLocationId` or
   *  legacy `location`). Mutually exclusive with `polygonPresent`. */
  locationsPresent: boolean
  point: MapPoint | null
  setPoint: (point: MapPoint) => void
  clearPoint: () => void
  multiUnits: ApiListing[]
  saveMultiUnits: (listings: ApiListing[]) => void
  clearMultiUnits: () => void
  cachedListing: ApiListing | null
  saveCachedListing: (listing: ApiListing | null) => void
  clearCachedListing: () => void
  clearGridCache: () => void
}

/**
 * Stable filter-mutation actions, split into their own context so writers (e.g.
 * the map location selection) can change filters without subscribing to — and
 * re-rendering on — every `filters`/`listings` change. The callbacks use
 * functional `setState`, so their identity never changes.
 */
export type SearchActionsType = Pick<
  SearchContextType,
  'addFilters' | 'removeFilters' | 'setPoint' | 'clearPoint' | 'clearPolygon'
>
