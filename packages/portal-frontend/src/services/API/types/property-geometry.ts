import { type Point, type Polygon } from 'geojson'

import { type ApiListing } from './listings'
import { type ApiQueryResponse } from './search'

export enum ResultsGridMode {
  Search = 'Search',
  MultiUnit = 'MultiUnit'
}

export interface BuildingMetadataAPIV2QueryResponse {
  types: {
    [type: number]: ApiQueryResponse
  }
}

export interface BuildingMetadataAPIV2ListingsResponse {
  types: {
    [type: number]: ApiListing[]
  }
}

export type PropertyBuilding = {
  polygon: Polygon
  floors: number
  buildingType?: 'main' | 'secondary' | 'garage' | 'pool' | 'other'
}

export type PropertyTree = {
  point: Point
  treeType: 'large-tree' | 'small-tree' | 'large-pine' | 'small-pine'
}

export type PropertyGeometry = {
  mlsNumber: string
  boardId: number
  lot: Polygon
  buildings: PropertyBuilding[]
  trees: PropertyTree[]
}

export type PropertyGeometryRequest = {
  listingIds: string[]
}

export type PropertyGeometryResponse = {
  listings: PropertyGeometry[]
}
