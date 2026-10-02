import deepmerge from 'deepmerge'
import type { ExpressionSpecification } from 'mapbox-gl'

import mapConfig from '@configs/map'
import type { PolygonStyleOverride } from '@defaults/map'

import { createPolygonColors } from './overlays'

/** Mapbox polygon paint — values may be feature-state `case` expressions. */
export type PolygonPaint = {
  'fill-color': string | ExpressionSpecification
  'fill-opacity': number | ExpressionSpecification
  'line-color': string | ExpressionSpecification
  'line-width': number | ExpressionSpecification
  'line-opacity': number | ExpressionSpecification
}

/**
 * Polygon interaction pattern:
 * - `static`    — always visible (standalone overlay polygons), non-interactive.
 * - `polygon`   — interactive selection polygon, whether revealed by hovering a
 *   linked marker (marker overlays) or by hovering the polygon itself (polygon-
 *   select overlays). Hidden until hover/select; hover-reveal at
 *   `polygonStyle.polygonHoverWidth` + a contrasting colour; fill when selected;
 *   deselect red from `deselectColor`.
 * - `selection` — default *selected* fill for a selected location with no active
 *   overlay (always filled with the base colour, non-interactive).
 */
export type PolygonContext = 'static' | 'polygon' | 'selection'

type PolygonStyleOptions = {
  /** Per-instance main colour (overlays). Locations use the base/highlight colours. */
  color?: string
  /** Per-instance main colour in satellite/hybrid mode. Defaults to `color`. */
  satelliteColor?: string
  /** Satellite/hybrid map style active. */
  dark?: boolean
  /** Per-overlay paint override, applied last (wins over base/colour). */
  style?: PolygonStyleOverride
}

const hover: ExpressionSpecification = [
  'boolean',
  ['feature-state', 'hover'],
  false
]
const selected: ExpressionSpecification = [
  'boolean',
  ['feature-state', 'selected'],
  false
]
// Chip-hover preview: show the hover OUTLINE on a selected polygon without the
// map-hover deselect-red — keeps the selected fill, just thickens the border.
const preview: ExpressionSpecification = [
  'boolean',
  ['feature-state', 'preview'],
  false
]

/**
 * Resolve a polygon's Mapbox paint from the single `polygonStyle` cascade:
 * base → satellite (dark) → per-instance colour, then build
 * the feature-state expressions for the context's interaction pattern. Shared by the
 * single polygon renderer (`utils/map/polygons`), so every polygon — drawn area,
 * boundary, overlay, selection, radius circle — resolves the same way and differs
 * only in colour.
 */
export const resolvePolygonStyle = (
  context: PolygonContext,
  { color, satelliteColor, dark = false, style }: PolygonStyleOptions = {}
): PolygonPaint => {
  const ps = mapConfig.polygonStyle

  // Cascade: base → satellite (dark) → per-instance colour → per-overlay override
  // (+ its satellite). deepmerge with array-replace. `merged` stays at the BASE
  // width/colour; the `polygon` context applies the thicker hover outline
  // (polygonHoverWidth) per-state below (not merged in, so SELECTED keeps base 1.5).
  const overwrite: deepmerge.Options = { arrayMerge: (_, src) => src }
  let merged: PolygonPaint = {
    'fill-color': ps['fill-color'],
    'fill-opacity': ps['fill-opacity'],
    'line-color': ps['line-color'],
    'line-width': ps['line-width'],
    'line-opacity': ps['line-opacity']
  }
  if (dark) merged = deepmerge(merged, ps.satellite, overwrite)

  // Per-instance colour (overlays): fill/line derived from one main colour.
  const main = dark ? (satelliteColor ?? color) : color
  if (main) merged = deepmerge(merged, createPolygonColors(main), overwrite)

  // Per-overlay override (e.g. parcels) wins over base + colour, in both modes.
  if (style) {
    const { satellite: styleSatellite, ...stylePaint } = style
    merged = deepmerge(merged, stylePaint, overwrite)
    if (dark && styleSatellite)
      merged = deepmerge(merged, styleSatellite, overwrite)
  }

  if (context === 'polygon') {
    // Polygon-select overlays, per state:
    // - hover (revealed): thicker hover width (polygonHoverWidth) + a more
    //   contrasting SOLID colour (the overlay's own colour, un-lightened).
    // - selected (not hovered): the standard BASE width (1.5) + normal (lightened)
    //   colour, filled.
    // - deselect (selected && hover): outline + fill turn red.
    const deselect: ExpressionSpecification = ['all', selected, hover]
    // Outline thickens on map-hover OR chip-preview; only map-hover (→ deselect)
    // turns red, so a chip-preview keeps the selected fill + a plain hover border.
    const hoverOutline: ExpressionSpecification = ['any', hover, preview]
    const redLine = ps.deselectColor
    const redFill = createPolygonColors(redLine as string)['fill-color']
    const hoverWidth = ps.polygonHoverWidth
    const hoverColor = main ?? (merged['line-color'] as string)
    return {
      ...merged,
      'line-width': [
        'case',
        hoverOutline,
        hoverWidth,
        selected,
        merged['line-width'],
        0
      ] as ExpressionSpecification,
      'line-color': [
        'case',
        deselect,
        redLine,
        hoverOutline,
        hoverColor,
        merged['line-color']
      ] as ExpressionSpecification,
      'fill-color': [
        'case',
        deselect,
        redFill,
        merged['fill-color']
      ] as ExpressionSpecification,
      'fill-opacity': [
        'case',
        selected,
        merged['fill-opacity'],
        0
      ] as ExpressionSpecification
    }
  }

  if (context === 'selection') {
    // A selected location with no active overlay — always filled in the base
    // colour, non-interactive (no feature-state).
    return { ...merged, 'fill-opacity': ps['fill-opacity'] }
  }

  return merged
}
