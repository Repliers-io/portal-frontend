import { useEffect, useEffectEvent, useRef } from 'react'
import { type Polygon } from 'geojson'
import { useTranslations } from 'next-intl'

import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { useLocationSelection } from '@shared/Map/hooks'

import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'

import './styles.css'
import drawStyles from './styles'

import { freehandMode } from './freehandMode'
import { type DrawTool } from './useMapDrawButton'

// Draw tool (editMode) → the gl-draw mode that draws it
const drawModes: Record<DrawTool, string> = {
  draw: 'draw_polygon',
  freehand: 'draw_freehand'
}

// Lets drags reach the canvas instead of the DOM listing markers
const markersOff = 'disable-pointer-events'

/**
 * Owns the search map's single MapboxDraw control, following `editMode`: created
 * when a draw tool is picked, switched between the point and freehand modes in
 * place, removed when drawing ends. One owner because two controls would clash
 * on gl-draw's fixed source ids. A drawn (or edited) ring becomes the search polygon.
 */
export const useMapDraw = () => {
  const { mapRef, setTitle, editMode } = useMapOptions()
  const { setLocations } = useMapLocations()
  const { clearLocationFilters } = useLocationSelection()
  const { setPolygon } = useSearch()
  const t = useTranslations()
  // The live control and its teardown — listeners are bound per control
  const drawRef = useRef<{ draw: MapboxDraw; remove: () => void } | null>(null)

  // Effect events: the control's listeners outlive many renders, yet read the
  // latest providers
  const clearLocations = useEffectEvent(() => setLocations(null))

  const onChange = useEffectEvent(
    (draw: MapboxDraw, classList: DOMTokenList) => {
      const [feature] = draw.getAll().features
      if (!feature) return
      // A point polygon stays selected for vertex editing; a freehand one is final
      const freehand = draw.getMode() === drawModes.freehand
      classList.toggle(markersOff, !freehand)
      setTitle(t(freehand ? 'Map.freehandDone' : 'Map.editPolygon'))
      setPolygon((feature.geometry as Polygon).coordinates[0])
      clearLocationFilters()
    }
  )

  // Point tool only — the freehand mode never selects
  const onSelectionChange = useEffectEvent(
    (selected: boolean, classList: DOMTokenList) => {
      classList.toggle(markersOff, selected)
      setTitle(t(selected ? 'Map.editVertex' : 'Map.editPolygon'))
    }
  )

  useEffect(() => {
    const map = mapRef.current
    // The save-search viewport highlight leaves the control as it is
    if (!map || editMode === 'highlight') return
    const { classList } = map.getContainer()

    if (!editMode) {
      classList.remove(markersOff)
      drawRef.current?.remove()
      drawRef.current = null
      return
    }

    // Selected locations and a drawn area are mutually exclusive
    clearLocations()
    classList.add(markersOff)

    const mode = drawModes[editMode]
    if (drawRef.current) {
      drawRef.current.draw.deleteAll().changeMode(mode)
      return
    }

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      modes: { ...MapboxDraw.modes, [drawModes.freehand]: freehandMode },
      defaultMode: mode,
      clickBuffer: 15,
      touchBuffer: 15,
      styles: drawStyles
    })

    const handleChange = () => onChange(draw, classList)
    const handleSelectionChange = ({
      features
    }: MapboxDraw.DrawSelectionChangeEvent) =>
      onSelectionChange(features.length > 0, classList)

    map.on('draw.create', handleChange)
    map.on('draw.update', handleChange)
    map.on('draw.selectionchange', handleSelectionChange)
    map.addControl(draw)

    drawRef.current = {
      draw,
      remove: () => {
        map.off('draw.create', handleChange)
        map.off('draw.update', handleChange)
        map.off('draw.selectionchange', handleSelectionChange)
        map.removeControl(draw)
      }
    }
  }, [editMode, mapRef])
}
