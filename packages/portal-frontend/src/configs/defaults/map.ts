import type { FeatureCollection, Position } from 'geojson'
import { type LngLat, type LngLatBounds, type MapOptions } from 'mapbox-gl'
import type { ComponentType } from 'react'

import type { Features } from '@configs/features'

import type { ApiLocation, LocationType } from 'services/API'

import { alpha, lighten } from '@mui/material/styles'

export type OverlayLayerClusterConfig = {
  /** Zoom level above which clustering is disabled. Default: 14 */
  maxZoom?: number
  /** Radius of each cluster in pixels. Default: 50 */
  radius?: number
  /** Minimum number of points to form a cluster. Default: 2 */
  minPoints?: number
}

/**
 * Individual-marker shape for an overlay. Config-level vocabulary mapping to the
 * shared `MarkerKind` (markerElement): 'dot' → dot, 'name' → name-tag (pill with
 * `properties.name`), 'icon' → icon-dot (needs `marker.icon`). 'pill' is
 * listings-only and 'cluster' is applied automatically, so neither is selectable here.
 */
export type OverlayMarkerType = 'dot' | 'name' | 'icon'

/** An overlay's individual-marker presentation + behaviour (clusters are automatic). */
export type OverlayMarkerConfig = {
  /** Marker shape. Defaults to 'dot' — the smallest. 'icon' needs `icon`. */
  type?: OverlayMarkerType
  /** MUI icon rendered inside the marker when `type: 'icon'` (dot grows to 32×32). */
  icon?: ComponentType
  /** Clicking a marker below this zoom centers + zooms the map to this level. */
  clickZoom?: number
  /** Marker z-index vs other overlays — higher sits on top. Defaults to 0. */
  zIndex?: number
  /**
   * Render a selected visual on the marker (darker border + lighter fill) when its
   * location is selected. Independent of any polygon — enable it for marker-only
   * overlays (the marker is the sole representation) or alongside a polygon.
   */
  selectedState?: boolean
}

export type OverlayFilterOption = {
  key: string
  label: string
  defaultValue: boolean
  dividerAfter?: boolean
  /** Options sharing a group must keep at least one enabled — the last active one can't be unchecked. */
  group?: string
}

export type OverlayPolygonConfig = {
  // The polygon source + layer ids are derived from the overlay id via
  // `overlayPolygonId` (`${id}-polygons`) — not configured per overlay.
  /** Override the polygon's main colour; defaults to the overlay's `color`. */
  color?: string
  /** Per-overlay paint override, deep-merged over the shared polygonStyle base. */
  style?: PolygonStyleOverride
  /**
   * A wider line drawn UNDER the outline. A white outline reads over imagery and
   * disappears over a pale basemap; a dark casing beneath gives it an edge on both
   * without changing the colour the reader sees.
   */
  casing?: PolygonStyleOverride
  /**
   * When on, this polygon is hidden until the user hovers its marker, then
   * revealed — a catchment/boundary tied to the markers. The marker↔polygon link
   * key is internal and uniform (plain `id`, put on every feature by the GeoJSON
   * converters). Absence means standalone polygon mode: always visible,
   * non-interactive, rendered instead of point markers.
   */
  showOnMarkerHover?: boolean
  /**
   * When on, hovering the location's MapTitle chip previews this polygon: keeps the
   * selected fill and thickens the outline to the hover style (no map-hover deselect
   * red). Works for both polygon-select and marker-select overlays.
   */
  previewState?: boolean
}

/**
 * Style overrides applied when the map is in satellite or hybrid mode — the single
 * place an overlay tunes its satellite look. All fields are optional; only the
 * aspects that differ need to be specified.
 */
export type OverlaySatelliteOverride = {
  /** Override marker/cluster colour in satellite/hybrid mode. Rebuilds paint. */
  marker?: { color?: string }
  /** Override the polygon's main colour in satellite/hybrid mode. */
  polygon?: { color?: string }
}

/** Partial polygon paint deep-merged over the base in satellite/hybrid styles. */
export type PolygonSatelliteOverride = {
  'fill-color'?: string
  'fill-opacity'?: number
  'line-color'?: string
  'line-width'?: number
  'line-opacity'?: number
}

/** Per-overlay paint override (wins over the shared base), with an optional
 * satellite/hybrid variant. */
export type PolygonStyleOverride = PolygonSatelliteOverride & {
  satellite?: PolygonSatelliteOverride
}

/**
 * External-source location support for a selectable overlay: its entities live
 * outside the Repliers API, so selections serialize into the `externalLocationId`
 * URL param / filter as `<overlayId>-<rest>`. `rest` is opaque to the shared
 * mechanism — this contract is the only place that builds and parses it (the
 * overlay's `fetchData` stamps the full id onto feature `locationId`/`id`).
 */
export type OverlayExternalLocations = {
  /**
   * Resolve `rest` back to a full location with `map.boundary` (merged
   * MultiPolygon) — used on reload and to backfill a clicked marker's geometry.
   * Null when the entity no longer resolves.
   */
  resolveLocation: (rest: string) => Promise<ApiLocation | null>
  /**
   * Token of the boundary-relevant filter options (from the layer's effective
   * options). Selected ids carrying a different token are dropped while the
   * layer is active — the reset-on-filter-change rule.
   */
  filterToken: (options: Record<string, boolean>) => string
}

/**
 * Per-surface availability of an overlay (used by `showOn.search` /
 * `showOn.listing`). The visibility default differs per surface, but the
 * default-active rule is uniform: an overlay only starts ENABLED on map load
 * when its value is `{ active: true }`. A bare `true` shows the overlay but
 * leaves it disabled — default-active is always explicit opt-in, never implicit.
 */
export type OverlaySurfaceVisibility = boolean | { active?: boolean }

export type OverlayLayerDefinition = {
  id: string
  /** Marker layer id; defaults to `id + '-markers'` — omit when the convention holds. */
  layerId?: string
  label: string
  /**
   * The overlay's single colour source — drives markers, the polygon and the
   * active button. Defaults to the palette `info` colour when omitted; the polygon
   * may override it via `polygon.color`. Resolve through `overlayAccent` /
   * `overlayPolygonColor` (utils/map/overlays) — never read raw, it may be unset.
   */
  color?: string
  cluster?: OverlayLayerClusterConfig
  /** Optional sub-filters rendered as checkboxes in the layer popover. All default to true. */
  filterOptions?: OverlayFilterOption[]
  /**
   * Optional polygon overrides. Polygons render automatically whenever the
   * overlay's data contains them — this only tunes HOW: `showOnMarkerHover` makes
   * the polygon a catchment hidden until its marker is hovered (else it's a
   * standalone, always-visible boundary); `color` / `style` override the paint.
   */
  polygon?: OverlayPolygonConfig
  /**
   * Paint for the single polygon the listing page draws on its address map, where
   * `polygon` above dresses a viewport full of them. One outline over one house can
   * afford to be heavier than a lattice of lot lines, and it must hold on every map
   * style — so this override carries no `satellite` variant and wins in both.
   */
  listingPolygon?: OverlayPolygonConfig
  /** Style overrides applied when the map is in satellite or hybrid mode */
  satellite?: OverlaySatelliteOverride
  /**
   * Placeholder overlay without a data source. `fetchData` is not called and
   * nothing is rendered on the map. The chip still appears; the list panel
   * shows a "coming soon" state.
   */
  stub?: boolean
  /**
   * Controls on which maps this overlay is available, and whether it starts
   * enabled there. Default-active is explicit opt-in on every surface — only
   * `{ active: true }` seeds the overlay into the initial layer set; a bare
   * `true` shows it but leaves it off (see {@link OverlaySurfaceVisibility}).
   *
   * - `search` — hidden by default; `true` / `{ active }` lists it in the main
   *   search map's `MapLayersMenu`, and `{ active: true }` also enables it on load.
   * - `listing` — shown by default on the PDP neighborhood map; `false` hides it
   *   entirely, and `{ active: true }` enables it on load.
   */
  showOn?: {
    search?: OverlaySurfaceVisibility
    listing?: OverlaySurfaceVisibility
    /**
     * Whether this overlay appears as a row in the search map's `MapLayersMenu`
     * list. Default `true`. Set `false` to keep the overlay fully active but
     * control it from a standalone `OverlayToggleButton` instead of the list.
     */
    menu?: boolean
  }
  featureFlag?: keyof Features
  /**
   * Publish this overlay's fetched FeatureCollection into `useMapLayers().layerData`,
   * so React consumers can read the geometry. Opt-in: publishing every overlay would
   * push hundreds of features into context on each pan and re-render every consumer.
   */
  publishData?: boolean
  /**
   * This overlay's parcels come from the Repliers public record, so the listing page
   * may look one up and show the assessor's facts for it. Two tenants draw an overlay
   * called `parcels` from different datasets — the id alone says nothing about where
   * the geometry came from, and only this one carries a record.
   */
  publicRecord?: boolean
  /**
   * How this overlay participates in the shared location selection
   * (`MapOptionsProvider.locations` + the `locationId` search filter):
   * - `'marker'`  — clicking the overlay's marker toggles the location.
   * - `'polygon'` — hovering reveals the overlay polygon and clicking it toggles
   *   the location.
   * - `null`/absent — non-interactive (standalone polygons).
   * Main-search-map only; wired by `useOverlaySelectsLocation`.
   */
  selectable?: 'marker' | 'polygon' | null
  /**
   * The `ApiLocation.type`s this overlay requests and renders (e.g. `['school']`;
   * SERHANT's neighbourhoods add LiveBy's `neighborhood-alternate`). Lets the app
   * map a location (resolved from a saved `locationId` on reload) back to the
   * overlay that draws/selects it — so its polygon is restored in the overlay's
   * colour + deselect behaviour, not the generic selection style.
   */
  locationTypes?: LocationType[]
  /**
   * External-source selection support: present when the overlay's locations are
   * NOT resolvable through the Repliers `/locations` API and instead round-trip
   * the URL via `externalLocationId` (see OverlayExternalLocations).
   */
  external?: OverlayExternalLocations
  /**
   * When true, hovering the overlay's interaction surface — its markers (marker
   * overlays) or its polygon (polygon-only overlays) — shows a popup rendered by
   * the tooltip component registered under this overlay's id in `tooltipRegistry`.
   */
  tooltip?: boolean
  /**
   * Layer the polygon-hover tooltip queries, instead of this overlay's own
   * `${overlayPolygonId(id)}-fill`. Lets an overlay expose only a subset of its
   * polygons to hover — those drawn by another layer.
   */
  tooltipLayerId?: string
  /**
   * When set, clicking the chip to enable the layer while below this zoom flies the
   * map up to it first — the level at which the layer is worth looking at.
   */
  activationMinZoom?: number
  /**
   * Zoom below which an active layer stops rendering (auto-hides) and re-fetches once
   * zoomed back in. Defaults to `activationMinZoom`, so one value covers both by
   * default. Set it LOWER to let the user pan back out a step without the layer
   * vanishing — bounded by the API's 300-per-page cap, past which the layer would
   * draw an arbitrary subset.
   */
  renderMinZoom?: number
  /**
   * Custom click handler for individual markers. When provided, it takes
   * precedence over `marker.clickZoom` — the caller is responsible for any
   * map movement. Receives the feature properties of the clicked marker.
   * Return true when the click was fully handled (deselected the marker, or
   * navigated away) so the interaction layer keeps the tooltip hidden.
   */
  onMarkerClick?: (properties: Record<string, unknown>) => void | boolean
  /** Marker presentation + behaviour for this overlay's individual markers. */
  marker?: OverlayMarkerConfig
  fetchData: (
    bounds: LngLatBounds,
    signal: AbortSignal,
    options: Record<string, boolean>,
    zoom: number,
    layer: OverlayLayerDefinition
  ) => Promise<FeatureCollection>
}

// Tenant-first on purpose (unlike `./colors` above): the control chrome follows
// the tenant brand without every tenant re-declaring it.
import { primary } from '@configs/colors'

import { overlayLayers } from './overlays/liveBy'
import { parcelsLayers } from './overlays/parcels'
import { error, info } from './colors'

/**
 * Colours of the control-stack buttons (`controls.colors`). Optional slots keep
 * MUI behaviour: no `hoverBg` — default hover overlay; no `disabledIcon` —
 * `action.disabled` grey.
 */
export type ControlColors = {
  icon: string
  activeIcon: string
  bg: string
  activeBg: string
  disabledBg: string
  hoverBg?: string
  disabledIcon?: string
}

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY || ''

export type CompassMode = 'static' | 'dynamic' | false

export type ControlsPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left'

export type ModifierKey = 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey'

export type InitialView = { lat: number; lng: number; zoom: number }

/**
 * Map engine config — the interactive search/PDP map and static images. Import as
 * `import map from '@configs/map'`. Every tenant customizes this to frame its own
 * region (initial view + `searchArea.defaultPolygon`) and brand its markers.
 *
 * Covers: the Mapbox provider + defaults, 3D pitch/rotation, on-screen controls,
 * base map styles, polygon/marker paint, zoom thresholds, the geographic search
 * area, proximity-search bias, and the overlays (schools, neighborhoods, …).
 *
 * The frontend never calls the Repliers MLS API directly — `searchArea` bounds the
 * queries the proxy backend forwards. `accessToken` comes from `NEXT_PUBLIC_MAPBOX_KEY`
 * (empty string when unset, so the app degrades instead of throwing).
 */
const config = {
  /** Map engine for static images + interactive maps. Only 'mapbox' is fully wired. */
  provider: 'mapbox' as 'mapbox' | 'google',
  /**
   * Options passed to the Mapbox `Map` constructor. `zoom` is the default fallback
   * level; `minZoom`/`maxZoom` clamp the range (integers). Several defaults are off
   * so their gestures can be reused for our custom 3D controls (see per-field notes).
   */
  mapboxDefaults: {
    zoom: 4,
    minZoom: 4,
    maxZoom: 18,
    boxZoom: false, // Disable Shift+drag box zoom to free Shift for 3D rotation
    dragRotate: false, // Disable default right-click rotation to use our custom handlers
    pitchWithRotate: false, // Disable default pitch with rotation
    touchZoomRotate: true, // Enable touch zoom-rotate
    doubleClickZoom: true,
    attributionControl: false,
    logoPosition: 'bottom-left',
    accessToken
  } as Partial<MapOptions>,
  /**
   * 3D map behaviour — pitch (tilt) and bearing (rotation), including the modifier
   * keys and sensitivity that drive them. Gated by `enabled`; when off the map stays
   * flat. `pitch`/`bearing` themselves live on the runtime camera, not here.
   */
  map3D: {
    enabled: true,
    windows: {
      enabled: true,
      floorHeight: 3,
      unitWidth: 3.1,
      peakLitPercent: 35,
      peakNightPercent: 50, // Position within the moon interval (1–99%).
      lightsOutPercent: 60 // Share of peak-lit windows that go dark by the end.
    },
    pitchEnabled: true,
    rotationEnabled: true,
    rotationEnabledIn2D: true, // Allow rotation in 2D mode, no need to switch to 3D
    wheelRotationEnabled: true, // Allow rotation with horizontal scroll
    wheelRotationRequiresModifier: true, // Require modifier key for touchpad horizontal-scroll rotation
    combinedMode: true, // Allow both pitch and rotation with single modifier
    // Available options: 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'
    pitchModifier: 'shiftKey' as ModifierKey,
    rotationModifier: {
      win: 'ctrlKey' as ModifierKey,
      mac: 'metaKey' as ModifierKey
    },
    // Mouse interaction sensitivity settings (lower = less sensitive)
    pitchSensitivity: 0.4,
    rotationSensitivity: 0.4,
    // Wheel/scroll sensitivity settings (lower = less sensitive)
    wheelRotationSensitivity: 0.1,
    wheelRotationDebounce: 500, // Debounce time in ms for wheel rotation end event

    /** Pitch bounds in degrees: `default` is applied on entering 3D, `max` clamps the tilt (Mapbox caps at 85). */
    pitch: {
      default: 45, // Default pitch when switching to 3D mode
      max: 60 // Maximum pitch allowed
    },
    animation: {
      duration: 500, // Duration for 3D transitions in ms
      easing: 'ease'
    }
  },
  /**
   * On-screen placement of the controls stack (zoom / 3D / draw). `position` is the
   * desktop corner, `mobilePosition` the phone override; `compass` picks the compass
   * mode ('static' | 'dynamic' | false — false hides it).
   */
  controls: {
    position: 'bottom-right' as ControlsPosition,
    mobilePosition: 'bottom-center' as ControlsPosition,
    compass: 'dynamic' as CompassMode,
    colors: {
      icon: primary,
      activeIcon: '#FFFFFF',
      bg: 'rgba(255, 255, 255, 0.7)',
      activeBg: alpha(primary, 0.8),
      disabledBg: 'rgba(255, 255, 255, 0.7)'
    } as ControlColors
  },
  /**
   * Base map style ids resolved against the tenant's Mapbox account. Keys are the
   * three selectable modes: `map` (streets), `hybrid` (satellite + labels) and
   * `satellite` (imagery only). `MapStyle` is derived from these keys.
   */
  mapStyles: {
    map: 'streets-v12',
    hybrid: 'satellite-streets-v12',
    satellite: 'satellite-v9'
  },
  /** Mapbox `flyTo` curve — how zoomed-out the arc goes mid-flight (higher = more). */
  mapFlyCurve: { curve: 1 },
  /**
   * Animate the location-header map camera when navigating between locations.
   * `false` snaps instantly (same destination, no fly/ease tween). The camera
   * logic is unchanged either way — this only toggles the animation.
   */
  animateLocationTransition: true,
  /**
   * Unified polygon fill/line style — native Mapbox paint property names. One base
   * for location boundaries, overlay polygons and the draw polygon; each overlay
   * supplies only its colour (derived via createPolygonColors). Also carries the
   * selection-outline tokens, the satellite override and the draw-tool config below.
   */
  polygonStyle: {
    'line-width': 1.5,
    'line-opacity': 1,
    'line-color': lighten(info, 0.3),
    'fill-opacity': 0.3,
    'fill-color': lighten(info, 0.3),
    // Selection outline tokens — read by the resolver's 'polygon' context.
    // `deselectColor`: the red an already-selected polygon turns when re-hovered
    // (shared by marker- and polygon-select overlays). `polygonHoverWidth`:
    // the thicker outline a polygon-select overlay reveals on HOVER (selected keeps
    // the base 1.5; the contrasting hover colour is the overlay's own solid colour).
    deselectColor: error,
    polygonHoverWidth: 2,
    // Satellite/hybrid override — deep-merged over the base in dark map styles,
    // for ALL polygons. Empty by default; tenants/overlays opt in.
    satellite: {} as PolygonSatelliteOverride,
    // Draw tool (MapDrawButton): the in-progress polygon's active state and its
    // vertex/midpoint markers. Separate from the rendered polygon paint above —
    // these are gl-draw config values (reused across layers), not 1:1 paint props.
    draw: {
      color: info, // primary draw colour (active polygon + vertices)
      activeFillOpacity: 0.4, // active polygon fill while editing
      point: {
        radius: 7,
        midpointRadius: 5,
        color: '#ffffff'
      }
    }
  },
  /** Location-polygon rendering config. */
  locations: {
    // Max neighborhood locations to keep in cache
    neighborhoodCacheSize: 300
  },
  /** Marker presentation shared across the map. */
  marker: {
    // Pop-in animation when markers/clusters appear — shared by the DOM listing
    // markers and the vector overlay markers (schools etc., main + neighborhood map).
    animation: {
      enabled: true,
      duration: 480, // ms — total pop duration; controls the speed
      opacityRatio: 0.25 // opacity fades 0→1 over the first (duration * ratio)
    },
    // Colour of the single address (radius-less) point marker. Tenants override
    // with their brand colour; defaults to the palette `info` blue.
    pointColor: info,
    // Where a cluster marker sits: the API centroid or its bounds center.
    clusterPosition: 'centroid' as 'centroid' | 'boundsCenter'
  },
  /**
   * Zoom-level thresholds used across the map. Integers on the Mapbox 0–22 scale;
   * they gate what renders at a given zoom (search-area fit, address framing,
   * city↔neighborhood switch, point-vs-cluster markers, locations-page hover).
   */
  zoom: {
    area: 13, // search-area fit
    areaFallback: 9,
    address: 15,
    listingAddress: 18, // PDP address map
    cityThreshold: 10, // zoom <= this: cities, above: neighborhoods
    markerPoint: 12, // force point markers below this zoom
    // locations page header hover (coordinates-only, no polygon)
    locationHover: {
      city: 11,
      mainCity: 9, // main/capital city of the region (locationConfig.city)
      hood: 13
    }
  },
  /**
   * Geographic search area: the default limit polygon every tenant reframes for its
   * region, an optional hard constraint boundary, an optional fixed initial view, and
   * a debug toggle. Bounds the queries sent to the Repliers proxy — not just visuals.
   */
  searchArea: {
    /** Polygon (lat/lng ring) that limits searches and Repliers API requests (!). Tenants override for their region. */
    defaultPolygon: [
      { lat: 50.0, lng: -130.0 },
      { lat: 50.0, lng: -65.0 },
      { lat: 23.5, lng: -65.0 },
      { lat: 23.5, lng: -130.0 }
    ] as LngLat[],
    /**
     * Optional geographic boundary that constrains all listing queries. When set and
     * `searchConfig.constrainToSearchBoundary` is true, every `map=` request is
     * intersected with this polygon before being sent to the API.
     * Format: `Position[][][]` — array of polygons (MultiPolygon coords style), each with rings.
     */
    boundary: null as Position[][][] | null,
    /**
     * Optional fixed initial map view. When set, overrides `defaultPolygon`-based
     * `fitBounds` on first load (no URL params). Does not affect searches. Default is
     * Austin, TX + suburbs — tenants null this out to frame their own `defaultPolygon`.
     */
    initialView: {
      lat: 30.29,
      lng: -97.74,
      zoom: 11.5
    } as InitialView | null,
    /** Debug: render `defaultPolygon` (blue) and `boundary` (red) as overlays on the map. */
    debug: false
  },
  /**
   * Location bias for the proximity (autosuggest) search — where suggestions cluster
   * before the map has moved. `center` is the bias point; `language`/`country` scope
   * results; `limit` caps rows; `zoomThreshold` gates when proximity kicks in.
   */
  proximitySearch: {
    center: { lat: 37.0, lng: -98.5 } as LngLat,
    language: 'en',
    country: 'US',
    limit: 10,
    zoomThreshold: 8
  },
  /**
   * Map overlays (schools, neighborhoods, …) and their selection behaviour. `layers`
   * is the ordered list of `OverlayLayerDefinition`s (see the type above for per-layer
   * options); `persistSelection` controls what happens to a selection when hidden.
   */
  overlays: {
    layers: [...overlayLayers, ...parcelsLayers],
    /**
     * Hiding a selectable overlay drops its selected locations by default, so the map
     * and result set stay consistent. Set true to instead keep the selection and
     * persist its markers/polygons on the map (complex mode — handled separately).
     */
    persistSelection: false
  }
}

export type MapStyle = keyof typeof config.mapStyles

export default config
