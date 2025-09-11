import type { Position } from 'geojson'

import {
  type ApiCluster,
  type ApiQueryResponse,
  type Property
} from 'services/API'
import { type Filters } from 'services/Search'

export type SavedResponse = {
  count: number
  page: number
  pages: number
  list: Property[]
  clusters: ApiCluster[]
  statistics: { [key: string]: any }
}

export type SearchContextType = SavedResponse & {
  loading: boolean
  filters: Partial<Filters>
  setFilter: (key: keyof Filters, value: any) => void
  setFilters: (filters: Partial<Filters>) => void
  addFilters: (newFilters: Partial<Filters>) => void
  removeFilter: (key: keyof Filters) => void
  removeFilters: (keys: (keyof Filters)[]) => void
  resetFilters: () => void
  search: (params: any) => Promise<ApiQueryResponse | undefined>
  save: (response: ApiQueryResponse) => SavedResponse
  polygon: Position[] | null
  setPolygon: (polygon: Position[]) => void
  clearPolygon: () => void
  multiUnits: Property[]
  saveMultiUnits: (properties: Property[]) => void
  clearMultiUnits: () => void
}
