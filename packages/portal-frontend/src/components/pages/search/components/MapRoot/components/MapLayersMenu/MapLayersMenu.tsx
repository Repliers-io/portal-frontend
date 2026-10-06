import { useRef, useState } from 'react'

import mapConfig from '@configs/map'

import { useMapLayers, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'

import { MapLayerRow, MapLayersButton, MapLayersDropdown } from './components'

/**
 * Container/skeleton for the overlay-layers menu: owns the data and popover state,
 * and renders one `MapLayerRow` per visible layer. The button, dropdown wrapper and
 * row are separate presentation components so a tenant can fork only their look via
 * `_<tenant>/` — e.g. movesmartly's row adds nested `filterOptions` checkboxes.
 */
export const MapLayersMenu = () => {
  const visibleLayers = mapConfig.overlays.layers.filter(
    (l) => l.showOn?.search && l.showOn?.menu !== false
  )
  const { activeLayers, loadingLayers } = useMapLayers()
  const { polygonPresent } = useSearch()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const { mapRef } = useMapOptions()

  // Pre-activated layer (URL) renders before the map is ready: keep the button
  // disabled AND visually neutral (no active fill) until the map exists — a
  // greyed control must never show its "on" state. Mirrors Map3DButton.
  const ready = Boolean(mapRef.current)
  // Only the menu's own (visible) layers light the button. A standalone layer like
  // neighborhoods (`menu: false`) toggles the same global activeLayers set but is
  // controlled by its own button — it must not mark this menu active.
  const hasActive = visibleLayers.some(({ id }) => activeLayers.has(id))
  const anyLoading = visibleLayers.some(({ id }) => loadingLayers.has(id))
  const activeLayer = visibleLayers.find(({ id }) => activeLayers.has(id))
  const activeAccent = activeLayer?.color

  // Every selectable row is blocked by an active search polygon (none is on and
  // each produces locations) → the whole menu is useless, so disable its trigger
  // too. A visible layer still on, or a non-selectable one, keeps it openable.
  const allBlocked =
    polygonPresent &&
    visibleLayers.every(
      (l) => !activeLayers.has(l.id) && Boolean(l.locationTypes?.length)
    )

  if (!visibleLayers.length) return null

  return (
    <>
      <MapLayersButton
        ref={anchorRef}
        active={hasActive && ready}
        open={open}
        loading={anyLoading}
        accent={activeAccent}
        disabled={!ready || allBlocked}
        blocked={allBlocked}
        onClick={() => setOpen((v) => !v)}
      />

      <MapLayersDropdown
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
      >
        {visibleLayers.map((layer) => (
          <MapLayerRow key={layer.id} layer={layer} />
        ))}
      </MapLayersDropdown>
    </>
  )
}
