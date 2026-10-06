import type { FeatureCollection } from 'geojson'
import {
  type LngLat,
  type Map as MapboxMap,
  Marker,
  type Popup
} from 'mapbox-gl'

import { PlaceIcon } from '@configs/icons'
import type { OverlayLayerDefinition } from '@defaults/map'
import {
  applyMarkerColors,
  createMarkerElement
} from '@shared/Map/markerElement'

import type { OverlayPopupState } from 'providers/MapOptionsProvider'
import { setHoverFeatureState } from 'utils/map/featureState'
import {
  markerLinkId,
  overlayAccent,
  overlayMarkerDomId,
  overlayPolygonId
} from 'utils/map/overlays'
import { renderIconSvg } from 'utils/map/renderIconSvg'

import {
  createOverlayIndex,
  type OverlayIndex,
  type OverlayMarkerDescriptor
} from './cluster'

/**
 * Per-overlay DOM-marker state, persisted across syncs (like the GL `layerRefs`):
 * the live markers keyed for diffing, plus a cached cluster index rebuilt only
 * when the fetched `data` reference changes.
 */
export type OverlayMarkersState = {
  markers: Map<string, Marker>
  data: FeatureCollection | null
  index: OverlayIndex | null
}

export const createOverlayMarkersState = (): OverlayMarkersState => ({
  markers: new Map(),
  data: null,
  index: null
})

export const removeOverlayMarkers = (state: OverlayMarkersState): void => {
  state.markers.forEach((m) => m.remove())
  state.markers.clear()
  state.data = null
  state.index = null
}

type PopupHandlers = {
  overlayPopupRef: { current: Popup | null }
  setOverlayPopup: (state: OverlayPopupState | null) => void
  // True while a marker tooltip owns the popup; prevents the polygon mousemove
  // handler from overriding or clearing it mid-hover.
  markerActiveRef: { current: boolean }
  // Tears down the marker preview a tap opened — its popup, its polygon highlight
  // and its ring. Touch fires no mouseleave, so every other exit (another marker,
  // a tap on empty map via `useOverlayPopupDismiss`) closes it through this.
  closeMarkerRef: { current: (() => void) | null }
}

/**
 * Pointer type of the gesture in progress. A `click` carries no reliable
 * `pointerType` (Safari leaves it empty), so the `pointerdown` that precedes it
 * records one here. Module scope is safe: one pointer drives the map at a time,
 * and pointerdown → click never interleaves across markers.
 */
let pointerType = 'mouse'

// DOM marker colour: satellite override over imagery, else the overlay accent
// (which itself defaults to the palette `info` colour).
const markerColor = (overlay: OverlayLayerDefinition, dark: boolean): string =>
  (dark ? overlay.satellite?.marker?.color : undefined) ??
  overlayAccent(overlay)

/**
 * Recolour an overlay's LIVE markers in place — for a map style switch that flips the
 * dark palette (vector ⇄ satellite). DOM markers survive `setStyle`, so this recolours
 * them via their CSS vars instead of dropping + recreating (which flickers them out and
 * back). A no-op in look when the overlay has no `satellite.marker` colour.
 */
export const recolorOverlayMarkers = (
  state: OverlayMarkersState,
  overlay: OverlayLayerDefinition,
  dark: boolean
): void => {
  const color = markerColor(overlay, dark)
  state.markers.forEach((marker) => {
    const lm = marker.getElement().querySelector('.lm')
    if (lm instanceof HTMLElement) applyMarkerColors(lm, color)
  })
}

const wireLeaf = (
  element: HTMLElement,
  d: OverlayMarkerDescriptor,
  map: MapboxMap,
  overlay: OverlayLayerDefinition,
  popup: PopupHandlers
): void => {
  const lm = element.querySelector('.lm')
  const showTooltip = (touch = false) => {
    if (!overlay.tooltip) return
    popup.markerActiveRef.current = true
    popup.overlayPopupRef.current?.setLngLat([d.lng, d.lat]).addTo(map)
    // Remove pointer-events override that polygon tooltips set via !important.
    const content = popup.overlayPopupRef.current
      ?.getElement()
      ?.querySelector('.mapboxgl-popup-content') as HTMLElement | null
    content?.style.removeProperty('pointer-events')
    popup.setOverlayPopup({
      overlayId: overlay.id,
      lngLat: { lng: d.lng, lat: d.lat } as LngLat,
      properties: d.properties,
      touch,
      // Config `selectable` alone is not enough: the PDP map draws the same
      // overlays but wires no selection — only the search map injects the handler.
      selectable: overlay.selectable === 'marker' && !!overlay.onMarkerClick
    })
  }
  const hideTooltip = () => {
    popup.markerActiveRef.current = false
    popup.overlayPopupRef.current?.remove()
    popup.setOverlayPopup(null)
  }

  // Linked-polygon cross-highlight: hovering a marker reveals its polygon
  // (`showOnMarkerHover` on the polygon enables it; the link key is `id`).
  const linkId = markerLinkId(overlay.polygon)
  const clickZoom = overlay.marker?.clickZoom
  const polygonHover = (hover: boolean) => {
    if (!linkId) return
    // Route through the guarded helper: a DOM marker can outlive its linked
    // polygon source (an inactive/not-yet-added overlay, or a `setStyle` that
    // wiped the GL sources while the DOM markers survived), and a raw
    // `setFeatureState` on a missing source throws "source does not exist".
    setHoverFeatureState(
      map,
      overlayPolygonId(overlay.id),
      d.properties?.[linkId],
      hover
    )
  }

  // Everything a tap owns, opened and closed as one: the tooltip, the linked
  // polygon and the ring (`.lm.active` — the touch stand-in for `:hover`, which
  // the stylesheet serves to fine pointers only).
  let preview = false
  const closePreview = () => {
    preview = false
    if (popup.closeMarkerRef.current === closePreview) {
      popup.closeMarkerRef.current = null
    }
    hideTooltip()
    polygonHover(false)
    lm?.classList.remove('active')
  }
  const openPreview = () => {
    popup.closeMarkerRef.current?.()
    preview = true
    showTooltip(true)
    polygonHover(true)
    lm?.classList.add('active')
    popup.closeMarkerRef.current = closePreview
  }

  // Hover is a fine-pointer interaction. Touch emulates `mouseenter` on tap (and
  // never emulates the matching leave), which showed a tooltip the same tap then
  // replaced with a selection — so touch pointers are dropped here and handled
  // by the click below.
  element.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return
    showTooltip()
    polygonHover(true)
    map.getCanvas().style.cursor = 'pointer'
  })
  element.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return
    hideTooltip()
    polygonHover(false)
    map.getCanvas().style.cursor = ''
  })
  element.addEventListener('pointerdown', (e) => {
    pointerType = e.pointerType || 'mouse'
  })
  element.addEventListener('click', (e) => {
    e.stopPropagation()
    const props = d.properties as Record<string, unknown>
    // clickZoom applies whether or not the marker also selects — zooming in
    // coexists with the selection/tooltip handling below.
    if (clickZoom && map.getZoom() < clickZoom) {
      map.easeTo({ center: [d.lng, d.lat], zoom: clickZoom })
    }
    // A tap is the preview a desktop user gets by hovering — never a commit. What
    // the desktop click does (select, navigate) moves into the tooltip's own
    // controls, so a fat-fingered tap can't change the search.
    if (pointerType === 'touch') {
      if (preview) closePreview()
      else openPreview()
      return
    }
    if (overlay.onMarkerClick) {
      if (overlay.onMarkerClick(props) === true) hideTooltip()
      else showTooltip()
    } else if (clickZoom || overlay.tooltip) {
      showTooltip()
    }
  })
}

const wireCluster = (
  element: HTMLElement,
  d: OverlayMarkerDescriptor,
  map: MapboxMap,
  index: OverlayIndex
): void => {
  element.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (d.clusterId == null) return
    map.easeTo({
      center: [d.lng, d.lat],
      zoom: index.getExpansionZoom(d.clusterId)
    })
  })
}

/**
 * Render one overlay's point features as DOM markers — the GL-free replacement
 * for the circle/halo/cluster layers in `addLayerToMap`. Clusters client-side
 * (`createOverlayIndex`), diffs descriptors by key against the live markers, and
 * wires hover/click/tooltip/linked-polygon per marker. Polygons are NOT handled here.
 *
 * A marker is rebuilt when its descriptor key changes — the key carries a content
 * signature (see `createOverlayIndex`), so a point that keeps its identity but
 * changes its rendered data (e.g. the schools overlay swapping englishBbox⇄
 * frenchBbox on a language toggle) gets a fresh marker with up-to-date handlers
 * instead of keeping a click/hover closure bound to the stale descriptor.
 */
export const renderOverlayMarkers = ({
  map,
  overlay,
  data,
  state,
  bbox,
  zoom,
  dark,
  popup,
  selectedIds
}: {
  map: MapboxMap
  overlay: OverlayLayerDefinition
  data: FeatureCollection
  state: OverlayMarkersState
  bbox: [number, number, number, number]
  zoom: number
  dark: boolean
  popup: PopupHandlers
  /** Currently selected location ids — a fresh marker for one of these (e.g. a
   *  `locationId` from the URL on load) is born selected, since the idle re-stamp
   *  may run before DOM markers exist. */
  selectedIds?: Set<string>
}): void => {
  // Rebuild the cluster index only when the fetched data reference changed.
  if (state.data !== data || !state.index) {
    state.index = createOverlayIndex(
      data.features,
      overlay.cluster,
      markerLinkId(overlay.polygon)
    )
    state.data = data
  }

  const descriptors = state.index.getDescriptors(bbox, zoom)
  const color = markerColor(overlay, dark)
  // Config marker shape → `MarkerKind`: 'name' → name-tag, 'icon' → icon-dot,
  // 'dot' (default) → dot. Clusters always override to a count bubble below.
  const markerType = overlay.marker?.type ?? 'dot'
  // 'icon' renders the overlay's `marker.icon`, falling back to a generic Place
  // pin when none is configured (so the dot is never an empty circle).
  const iconSvg =
    markerType === 'icon'
      ? renderIconSvg(overlay.marker?.icon ?? PlaceIcon)
      : undefined
  // z-index so higher-priority overlays (e.g. schools) sit above others. Mapbox
  // transforms each marker into its own stacking context, so the wrapper's
  // z-index controls inter-marker stacking.
  const zIndex = overlay.marker?.zIndex
  const nextKeys = new Set(descriptors.map((d) => d.key))

  state.markers.forEach((marker, key) => {
    if (!nextKeys.has(key)) {
      marker.remove()
      state.markers.delete(key)
    }
  })

  descriptors.forEach((d) => {
    if (state.markers.has(d.key)) return
    const cluster = d.count > 1
    const nameTag = !cluster && markerType === 'name'
    // Stamp a DOM id (keyed by location) on individual markers so the MapTitle
    // location chip can light this marker's ring on hover (`.lm.active`).
    const locationId = d.properties?.locationId
    // Born selected when its location is already in the selection and the overlay
    // opts in via `marker.selectedState` (covers the URL `locationId`-on-load case).
    const selected =
      !cluster &&
      !!overlay.marker?.selectedState &&
      typeof locationId === 'string' &&
      !!selectedIds?.has(locationId)
    const element = createMarkerElement({
      kind: cluster
        ? 'cluster'
        : markerType === 'name'
          ? 'name'
          : markerType === 'icon'
            ? 'icon-dot'
            : 'dot',
      color,
      label: cluster
        ? String(d.count)
        : nameTag
          ? String(d.properties?.name ?? '')
          : '',
      id:
        !cluster && typeof locationId === 'string'
          ? overlayMarkerDomId(locationId)
          : undefined,
      icon: cluster ? undefined : iconSvg,
      selected,
      hitArea: true
    })

    if (cluster) wireCluster(element, d, map, state.index!)
    else wireLeaf(element, d, map, overlay, popup)

    element.classList.add('lm--overlay')
    if (zIndex != null) element.style.zIndex = String(zIndex)
    state.markers.set(
      d.key,
      new Marker({ element }).setLngLat([d.lng, d.lat]).addTo(map)
    )
  })
}
