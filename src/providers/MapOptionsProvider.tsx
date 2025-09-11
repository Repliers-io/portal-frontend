'use client'

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react'
import { useSearchParams } from 'next/navigation'
import {
  type LngLat,
  type LngLatBounds,
  type Map as MapboxMap
} from 'mapbox-gl'

import { type MapStyle } from '@configs/map-styles'

import { getCoords, getZoom } from 'utils/map'

export type MapPosition = {
  center: LngLat | null
  bounds: LngLatBounds | undefined
  zoom: number
}

type MapLayout = 'map' | 'grid'

type MapEditMode = 'draw' | 'highlight' | null

type MapOptionsContextProps = {
  position: MapPosition
  setPosition: (position: MapPosition) => void
  layout: MapLayout
  setLayout: (layout: MapLayout) => void
  style: MapStyle
  setStyle: (style: MapStyle) => void
  title: string | null
  setTitle: (title: string | null) => void
  editMode: MapEditMode
  setEditMode: (mode: MapEditMode) => void
  clearEditMode: () => void
  mapRef: React.MutableRefObject<MapboxMap | null>
  setMapRef: (ref: MapboxMap) => void
}

const MapOptionsContext = createContext<MapOptionsContextProps | undefined>(
  undefined
)

const MapOptionsProvider = ({
  layout = 'map',
  style = 'map',
  title,
  // custom position used to initialize the map
  // on search results or saved searches polygon
  position,
  children
}: {
  layout: MapLayout
  style: MapStyle
  title?: string
  position?: MapPosition
  children?: React.ReactNode
}) => {
  const mapRef = useRef<MapboxMap | null>(null)
  const [mapStyle, setStyle] = useState(style)
  const [mapLayout, setLayout] = useState(layout)
  const [mapTitle, setTitle] = useState(title || null)
  const [editMode, setEditMode] = useState<MapEditMode>(null)
  const clearEditMode = () => setEditMode(null)

  const searchParams = useSearchParams()
  const initialPosition = useMemo(
    () => ({
      zoom: getZoom(searchParams),
      center: getCoords(searchParams),
      bounds: undefined
    }),
    []
  )

  const [mapPosition, setPosition] = useState<MapPosition>(
    position || initialPosition
  )

  const contextValue = useMemo(
    () => ({
      position: mapPosition,
      setPosition,
      layout: mapLayout,
      setLayout: setLayout,
      style: mapStyle,
      setStyle,
      title: mapTitle,
      setTitle,
      editMode,
      setEditMode,
      clearEditMode,
      mapRef,
      setMapRef: (ref: MapboxMap) => (mapRef.current = ref)
    }),
    [mapLayout, mapPosition, mapStyle, mapTitle, editMode]
  )

  return (
    <MapOptionsContext.Provider value={contextValue}>
      {children}
    </MapOptionsContext.Provider>
  )
}

export default MapOptionsProvider

export const useMapOptions = () => {
  const context = useContext(MapOptionsContext)
  if (!context) {
    // console.error('useMapOptions must be used within a MapOptionsProvider')
    // WARN: potentially dangerous fallback
    return {
      mapRef: { current: null },
      setMapRef: () => undefined,
      position: {} as MapPosition,
      setPosition: () => undefined,
      layout: 'map' as MapLayout,
      setLayout: () => undefined,
      style: 'map' as MapStyle,
      setStyle: () => undefined,
      title: null,
      setTitle: () => undefined
    }
  }
  return context
}
