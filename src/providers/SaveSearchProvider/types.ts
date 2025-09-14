import { type Position } from 'geojson'
import { type LngLatBounds } from 'mapbox-gl'

import {
  type ApiSavedSearch,
  type ApiSavedSearchUpdateRequest
} from 'services/API'
import type { Filters } from 'services/Search'

import { type notifications } from './constants'

export type NotificationFrequency = (typeof notifications)[number]

export type CreateSearchParams = {
  name?: string
  bounds?: LngLatBounds
  polygon?: Position[]
  filters?: Filters
  notificationFrequency?: NotificationFrequency
}

export type SaveSearchContextType = {
  list: ApiSavedSearch[]
  loading: boolean
  processing: boolean
  createSearch: ({
    name,
    bounds,
    filters,
    polygon,
    notificationFrequency
  }: CreateSearchParams) => Promise<void>
  editSearch: (id: number, params: ApiSavedSearchUpdateRequest) => void
  deleteSearch: (id: number) => void
  cancelDelete: () => void
  cancelEdit: () => void
  deleteId: number | null
  setDeleteId: (id: number | null) => void
  editId: number | null
  setEditId: (id: number | null) => void
}
