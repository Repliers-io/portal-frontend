import type { GeoJSONFeature, Map, MapMouseEvent } from 'mapbox-gl'

/**
 * Attaches mousemove/mouseleave handlers to a map layer that manage
 * Mapbox feature-state { hover } for the topmost feature under the cursor.
 *
 * Returns { cleanup, clear, suppress }:
 * - cleanup: removes all listeners (call on unmount)
 * - clear: programmatically clears hover (e.g. after a click)
 * - suppress: clears hover AND keeps the just-hovered feature un-hovered until the
 *   cursor leaves it — use after a click-select so a freshly-selected polygon does
 *   not flash its deselect-red while the cursor is still inside it. (Plain `clear`
 *   only resets the tracked id, so the very next mousemove re-hovers the feature.)
 */
export const setupHoverState = (
  map: Map,
  sourceId: string,
  layerId: string,
  options: {
    cursor?: boolean
    onEnter?: (id: string | number, feature: GeoJSONFeature) => void
    onLeave?: (id: string | number) => void
  } = {}
): { cleanup: () => void; clear: () => void; suppress: () => void } => {
  const { cursor = true, onEnter, onLeave } = options
  let hoveredId: string | number | null = null
  // The just-clicked feature: skip re-hovering it until the cursor leaves it (a
  // plain hover would re-fire on the next mousemove and flash the deselect-red).
  let suppressedId: string | number | null = null

  const clear = () => {
    if (hoveredId !== null) {
      map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false })
      onLeave?.(hoveredId)
      hoveredId = null
    }
    suppressedId = null
    if (cursor) map.getCanvas().style.cursor = ''
  }

  // Clear the current hover and keep that feature un-hovered until the cursor
  // leaves it (a real mouseleave, or moving onto a different feature).
  const suppress = () => {
    if (hoveredId === null) return
    map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false })
    onLeave?.(hoveredId)
    suppressedId = hoveredId
    hoveredId = null
  }

  const onMouseMove = (e: MapMouseEvent & { features?: GeoJSONFeature[] }) => {
    const feature = e.features?.[0]
    if (!feature) return
    const id = feature.id
    if (id == null) return

    // Moving onto a different feature lifts the suppression.
    if (suppressedId !== null && id !== suppressedId) suppressedId = null
    // The just-clicked feature stays un-hovered while the cursor sits inside it.
    if (id === suppressedId) {
      if (cursor) map.getCanvas().style.cursor = 'pointer'
      return
    }

    if (hoveredId !== null && hoveredId !== id) {
      map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false })
      onLeave?.(hoveredId)
    }

    if (hoveredId !== id) {
      map.setFeatureState({ source: sourceId, id }, { hover: true })
      hoveredId = id
      onEnter?.(id, feature)
    }

    if (cursor) map.getCanvas().style.cursor = 'pointer'
  }

  // Marker DOM events bubble into the map. A pointer crossing between the canvas and
  // a marker fires `mouseout`, which Mapbox reports as leaving the layer, while the
  // pointer is still over the feature and `mousemove` keeps tracking it. So only a
  // `relatedTarget` outside the canvas container counts as leaving.
  const onMouseLeave = (e?: MapMouseEvent) => {
    const to = e?.originalEvent.relatedTarget as Node | null | undefined
    if (to && map.getCanvasContainer().contains(to)) return
    clear()
  }

  map.on('mousemove', layerId, onMouseMove)
  map.on('mouseleave', layerId, onMouseLeave)

  return {
    cleanup: () => {
      map.off('mousemove', layerId, onMouseMove)
      map.off('mouseleave', layerId, onMouseLeave)
    },
    clear,
    suppress
  }
}

// The `hover` feature-state written from outside `setupHoverState`: a grid card or a
// price marker lighting the parcel under the listing.
export const setHoverState = (
  map: Map,
  source: string,
  id: string | number,
  hover: boolean
): void => {
  if (map.getSource(source)) map.setFeatureState({ source, id }, { hover })
}
