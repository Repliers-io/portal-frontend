import { type Map } from 'mapbox-gl'

import mapConfig from '@configs/map'

let webgl: boolean | null = null

/**
 * Why the map cannot be built, or null when it can. The Mapbox GL v3 Map
 * constructor throws when `NEXT_PUBLIC_MAPBOX_KEY` is unset ("An API access
 * token is required") and when a WebGL2 context cannot be created (e.g.
 * hardware acceleration is disabled in the browser). Consumers skip map
 * construction and MapContainer shows a message instead of crashing the page.
 */
export const mapUnavailable = () => {
  if (!mapConfig.mapboxDefaults.accessToken) return 'token'
  if (webgl === null) {
    const gl = document.createElement('canvas').getContext('webgl2')
    webgl = gl !== null
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  }
  return webgl ? null : 'webgl'
}

/**
 * Whether the style accepts `addSource` / `addLayer` right now: the stylesheet has
 * loaded and the map has not been removed.
 *
 * Deliberately not `isStyleLoaded()`. That answers "is everything idle" — it turns
 * false whenever any source has a tile in flight or a GeoJSON source is mid-`setData`,
 * which is most of the time right after a pan — while the only thing `addLayer`
 * checks is `style._loaded`. Both fields are in Mapbox's shipped typings.
 */
export const styleReady = (map: Map): boolean =>
  !map._removed && Boolean(map.style?._loaded)

/**
 * Runs `callback` as soon as the style accepts layers (see `styleReady`) —
 * immediately when it already does, otherwise on `style.load`, which always follows
 * a stylesheet load. Returns a cleanup that removes the listener if needed.
 */
export const executeOnStyleLoad = (
  map: Map,
  callback: () => void
): (() => void) => {
  if (styleReady(map)) {
    callback()
    return () => {
      // Already loaded — nothing was attached, so nothing to detach.
    }
  }

  const handler = () => {
    callback()
    map.off('style.load', handler)
  }

  map.on('style.load', handler)

  return () => {
    map.off('style.load', handler)
  }
}
