import type { Map } from 'mapbox-gl'

/**
 * Write the `selected` feature-state for one feature. Single source of truth for
 * the location-selection paint, shared by every selection entry point (overlay
 * polygons). No-op when the map or id is missing, or the source is not on the map
 * yet — clearing a removed selection sweeps every selectable overlay's polygon
 * source, but an inactive overlay's source isn't created, and `setFeatureState`
 * throws "source does not exist" for a missing source.
 */
export const setSelectedFeatureState = (
  map: Map | null | undefined,
  source: string,
  id: string | number | null | undefined,
  selected: boolean
): void => {
  if (!map || id == null) return
  if (!map.getSource(source)) return
  map.setFeatureState({ source, id }, { selected })
}

/**
 * Write the `preview` feature-state for one feature — the "hovered while selected"
 * affordance (e.g. hovering a location's MapTitle chip): keeps the selected fill but
 * thickens the outline to the hover style, WITHOUT the map-hover deselect-red. Same
 * guards as `setSelectedFeatureState`.
 */
export const setPreviewFeatureState = (
  map: Map | null | undefined,
  source: string,
  id: string | number | null | undefined,
  preview: boolean
): void => {
  if (!map || id == null) return
  if (!map.getSource(source)) return
  map.setFeatureState({ source, id }, { preview })
}

/**
 * Write the `hover` feature-state for one feature — on a selected polygon this is the
 * map-hover "click to remove" deselect-red. Used by the MapTitle chip's delete button
 * so hovering the X mirrors that state. Same guards as `setSelectedFeatureState`.
 */
export const setHoverFeatureState = (
  map: Map | null | undefined,
  source: string,
  id: string | number | null | undefined,
  hover: boolean
): void => {
  if (!map || id == null) return
  if (!map.getSource(source)) return
  map.setFeatureState({ source, id }, { hover })
}
