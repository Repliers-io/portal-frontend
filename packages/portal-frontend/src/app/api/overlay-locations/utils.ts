import { type ApiLocation } from 'services/API'

/**
 * Allowlist filter: keep only locations the static locations cache knows with a
 * positive count. The cache (`countsMap`) is generated over the whole region with
 * `hideTrash`, so it holds every location that had listings at generation and
 * NONE with a zero count — i.e. it is an allowlist of populated locations. Dirty
 * MLS `/locations` data returns many empty neighborhoods (often same-name
 * duplicates under different parent cities) that are absent from the cache;
 * dropping everything not in the cache removes them.
 *
 * Trade-off: a location that gained its first listings AFTER the cache was
 * generated is absent too and stays hidden until the cache is regenerated
 * (`pnpm generate:locations <tenant>`). Accepted — the alternative (a live count
 * per location) costs one request per viewport marker.
 */
export const filterLocationsByCounts = (
  locations: ApiLocation[],
  countsMap: Map<string, number>
): ApiLocation[] =>
  locations.filter((location) => (countsMap.get(location.locationId) ?? 0) > 0)
