import { type MapPoint } from 'services/Search'
import { arrayFromString } from 'utils/strings'

// Parse the `point=[lat,lng]` / `point=[lat,lng,radius]` URL value into a MapPoint.
// Returns undefined for missing/malformed input (never throws).
export const parsePoint = (value?: string | string[]): MapPoint | undefined => {
  const arr = arrayFromString(value)
  if (!Array.isArray(arr) || arr.length < 2) return undefined

  const [lat, lng, radius] = arr
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined

  return {
    center: [lat, lng],
    ...(Number.isFinite(radius) ? { radius } : {})
  }
}

// Serialize a MapPoint to the compact URL value `[lat,lng]` / `[lat,lng,radius]`.
// The label is intentionally dropped — it never persists in the URL.
export const serializePoint = (point: MapPoint): string => {
  const { center, radius } = point
  return JSON.stringify(radius != null ? [...center, radius] : center)
}
