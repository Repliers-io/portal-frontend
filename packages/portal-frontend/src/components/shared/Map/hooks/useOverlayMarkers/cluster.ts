import type { Feature, GeoJsonProperties, Point } from 'geojson'
import Supercluster from 'supercluster'

import type { OverlayLayerClusterConfig } from '@defaults/map'

/**
 * A DOM-marker descriptor: a clustered group (count > 1) or a single point.
 *
 * This is the client-side equivalent of what a GL source with `cluster: true`
 * produced — mapbox-gl runs the same supercluster internally, so moving the
 * markers to DOM just means running it ourselves over the fetched points.
 */
export type OverlayMarkerDescriptor = {
  /** Stable key for diffing markers across viewport changes. */
  key: string
  lng: number
  lat: number
  /** Points represented; 1 for an individual marker, > 1 for a cluster. */
  count: number
  /** supercluster id — present only for clusters, used to expand on click. */
  clusterId?: number
  /** Original feature properties (tooltip data); empty object for clusters. */
  properties: GeoJsonProperties
}

export type OverlayIndex = {
  /** Clusters + leaves visible in the given viewport at the given zoom. */
  getDescriptors: (
    bbox: [number, number, number, number],
    zoom: number
  ) => OverlayMarkerDescriptor[]
  /** Zoom at which a cluster breaks apart — for click-to-expand. */
  getExpansionZoom: (clusterId: number) => number
}

const isPoint = (f: Feature): f is Feature<Point> =>
  f.geometry?.type === 'Point'

// A per-leaf key so the same point keeps its marker across pans. Uses the
// overlay's marker id property when available, else falls back to coordinates.
// A content signature is appended so a point that keeps its identity but changes
// its rendered data (e.g. the schools overlay swapping englishBbox⇄frenchBbox on
// a language toggle) yields a NEW key — the marker is then a genuinely different
// thing ("a school with a different polygon") and gets rebuilt by the diff,
// rather than reusing a click/hover closure bound to the stale descriptor.
const leafKey = (
  properties: GeoJsonProperties,
  lng: number,
  lat: number,
  idProperty?: string
): string => {
  const identity =
    idProperty && properties?.[idProperty] != null
      ? `id-${String(properties[idProperty])}`
      : `pt-${lng},${lat}`
  return `${identity}:${JSON.stringify(properties ?? {})}`
}

const toLeaf = (
  properties: GeoJsonProperties,
  lng: number,
  lat: number,
  idProperty?: string
): OverlayMarkerDescriptor => ({
  key: leafKey(properties, lng, lat, idProperty),
  lng,
  lat,
  count: 1,
  properties
})

/**
 * Builds a clustering index for one overlay's point features. Rebuild only when
 * the data changes; query `getDescriptors` on every viewport change (cheap).
 * `idProperty` (the overlay's `markerLinkId`) gives leaves a stable key across
 * pans; it falls back to coordinates when absent.
 */
export const createOverlayIndex = (
  features: Feature[],
  cluster?: OverlayLayerClusterConfig,
  idProperty?: string
): OverlayIndex => {
  const points = features.filter(isPoint)

  // No cluster config → every point is an individual marker, no index needed.
  if (!cluster) {
    const leaves = points.map((f) =>
      toLeaf(
        f.properties ?? {},
        f.geometry.coordinates[0],
        f.geometry.coordinates[1],
        idProperty
      )
    )
    return { getDescriptors: () => leaves, getExpansionZoom: () => 0 }
  }

  const index = new Supercluster<GeoJsonProperties>({
    radius: cluster.radius ?? 50,
    minPoints: cluster.minPoints ?? 2,
    maxZoom: cluster.maxZoom ?? 14
  }).load(
    points.map((f) => ({
      type: 'Feature' as const,
      geometry: f.geometry,
      properties: f.properties ?? {}
    }))
  )

  return {
    getDescriptors: (bbox, zoom) =>
      index.getClusters(bbox, Math.floor(zoom)).map((c) => {
        const [lng, lat] = c.geometry.coordinates
        const props = c.properties as GeoJsonProperties & {
          cluster?: boolean
          cluster_id?: number
          point_count?: number
        }
        if (props?.cluster) {
          return {
            key: `cluster-${props.cluster_id}`,
            lng,
            lat,
            count: props.point_count ?? 0,
            clusterId: props.cluster_id,
            properties: {}
          }
        }
        return toLeaf(props, lng, lat, idProperty)
      }),
    getExpansionZoom: (clusterId) => index.getClusterExpansionZoom(clusterId)
  }
}
