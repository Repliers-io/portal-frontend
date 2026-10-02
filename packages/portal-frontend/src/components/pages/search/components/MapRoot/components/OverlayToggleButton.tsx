import { useTranslations } from 'next-intl'
import type { ComponentType } from 'react'

import { alpha, type SvgIconProps } from '@mui/material'

import type { OverlayLayerDefinition } from '@defaults/map'
import { MapControlButton } from '@shared/Map'
import { useOverlayToggle } from '@shared/Map/hooks'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { overlayAccent, overlayById } from 'utils/map/overlays'

export type OverlayToggleButtonProps = {
  /** Id of the overlay layer this button switches on/off. */
  overlayId: string
  /** Icon supplied by the caller (a MUI icon component). */
  icon: ComponentType<SvgIconProps>
  /** Tooltip text; defaults to a "Show/Hide the <layer> overlay layer" phrase. */
  label?: string
  /**
   * Paint the active button in the overlay's own accent colour. Off by default —
   * the active state uses the shared control accent like the other map controls.
   */
  accent?: boolean
}

// Inner control with the layer resolved, so the toggle hook is called
// unconditionally (the outer component may early-return on an unknown id).
const ToggleControl = ({
  layer,
  icon: Icon,
  label,
  accent
}: {
  layer: OverlayLayerDefinition
  icon: ComponentType<SvgIconProps>
  label?: string
  accent?: boolean
}) => {
  const { mapRef, position } = useMapOptions()
  const { active: on, loading, toggle, blocked } = useOverlayToggle(layer)
  const t = useTranslations()
  // Pre-activated overlay (URL) renders before the map is ready: keep the button
  // disabled AND visually neutral (no active fill) until the map exists — a greyed
  // control must never show its "on" state. Mirrors Map3DButton.
  const ready = Boolean(mapRef.current)
  const active = on && ready
  // On, but below the zoom at which the layer renders: it is switched on and drawing
  // nothing. `renderMinZoom` when the layer splits the two thresholds, otherwise the
  // activation zoom, which doubles as the render floor.
  const floor = layer.renderMinZoom ?? layer.activationMinZoom
  const dimmed = active && floor !== undefined && position.zoom < floor
  // Blocked by an active search polygon → keep the feature description and add
  // why it's unavailable, matching the guest draw hint. The phrase follows the
  // state: a control that is on offers to hide, not to show it again.
  const feature =
    label ??
    t(active ? 'Map.hideOverlayLayer' : 'Map.showOverlayLayer', {
      layer: String(layer.label).toLowerCase()
    })
  const title = blocked
    ? t('Map.overlayDisabledWhilePolygon', { feature })
    : feature
  const activeBg = accent ? alpha(overlayAccent(layer), 0.85) : undefined

  return (
    <MapControlButton
      title={title}
      active={active}
      dimmed={dimmed}
      activeBg={activeBg}
      loading={loading}
      disabled={!ready || blocked}
      onClick={toggle}
    >
      <Icon sx={{ fontSize: 20 }} />
    </MapControlButton>
  )
}

/**
 * Standalone map-control button that toggles a single overlay layer on/off, sitting
 * among the other map controls. Pair with `showOn: { menu: false }` on that overlay
 * so it is controlled here instead of in the `MapLayersMenu` list. The icon comes
 * from the caller; the tooltip defaults to a "Show/Hide <layer>" phrase. By default
 * the active state uses the shared control accent — pass `accent` for the overlay's
 * own colour.
 */
export const OverlayToggleButton = ({
  overlayId,
  icon,
  label,
  accent
}: OverlayToggleButtonProps) => {
  const layer = overlayById(overlayId)
  if (!layer) return null

  return (
    <ToggleControl layer={layer} icon={icon} label={label} accent={accent} />
  )
}
