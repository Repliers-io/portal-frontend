import type { Position } from 'geojson'
import { type LngLatBounds } from 'mapbox-gl'

import {
  defaultAdvancedFilters,
  defaultFilters,
  listingFields
} from '@configs/filters'
import { clusterLimit, resultsPerPage } from '@configs/search'

import { nonDefaultFilter } from 'utils/filters'
import { getDefaultBounds, toRectangle } from 'utils/map'

import type { Filters } from './types'

export const getListingFields = () => ({
  listings: true,
  fields: listingFields.join(',')
})

export const getClusterParams = (zoom: number) => ({
  aggregates: 'map',
  clusterLimit,
  clusterPrecision: Math.round(zoom) + 2
})

export const getMapRectangle = (bounds: LngLatBounds) => ({
  map: toRectangle(bounds)
})

export const getDefaultRectangle = () => ({
  map: toRectangle(getDefaultBounds())
})

export const getMapPolygon = (polygon: Position[]) => ({
  map: '[[' + polygon.map((p) => '[' + p.join(',') + ']').join(',') + ']]'
})

export const getPageParams = (pageNum: number = 1) => ({
  pageNum,
  resultsPerPage
})

export const getNonDefaultFilters = (
  filters: Filters,
  defaults: Filters = { ...defaultAdvancedFilters, ...defaultFilters }
): Filters =>
  Object.fromEntries(
    Object.entries(filters).filter((entry) => {
      return nonDefaultFilter(entry, defaults)
    })
  ) as Filters
