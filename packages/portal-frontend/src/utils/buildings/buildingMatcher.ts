import redirectsData from '@configs/redirects-buildings'
import redirectsManualData from '@configs/redirects-buildings-manual'

type ApiMatchParams = {
  city?: string
  neighborhood?: string
  buildingName?: string
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function decodeUrlSegment(segment: string): string {
  return decodeURIComponent(segment)
    .replace(/\u2011/g, '-')
    .replace(/-/g, ' ')
}

function parseDestination(destination: string): ApiMatchParams | null {
  if (!destination) return null

  const segments = destination.replace(/^\//, '').split('/')

  const routePrefixes = ['locations', 'building', 'condo-building', 'buildings']
  let startIndex = 0
  for (let i = 0; i < segments.length; i++) {
    if (routePrefixes.includes(segments[i])) {
      startIndex = i + 1
    } else {
      break
    }
  }

  const parts = segments.slice(startIndex)

  if (parts.length >= 3) {
    return {
      city: decodeUrlSegment(parts[0]),
      neighborhood: decodeUrlSegment(parts[1]),
      // last segment is always the building name; parts[2] may be an address slug
      buildingName: decodeUrlSegment(parts[parts.length - 1])
    }
  }
  if (parts.length === 2) {
    return {
      city: decodeUrlSegment(parts[0]),
      buildingName: decodeUrlSegment(parts[1])
    }
  }

  return null
}

// Map: normalized source path → destination  (CMS → API direction)
const sourcePathToDest = new Map<string, string>()
// Map: "city/neighborhood/buildingname" → cms slug  (API → CMS direction)
const destinationKeyToSlug = new Map<string, string>()

function normalizePath(path: string): string {
  return '/' + path.replace(/^\//, '').replace(/\/$/, '')
}

function buildDestinationKey(destination: string): string | null {
  const parsed = parseDestination(destination)
  if (!parsed) return null
  const parts = [parsed.city, parsed.neighborhood, parsed.buildingName].filter(
    Boolean
  )
  if (parts.length < 2) return null
  return (parts as string[]).map(slugify).join('/')
}

// Manual entries take precedence — spread first so they win on duplicate source paths
for (const entry of [...redirectsManualData, ...redirectsData]) {
  if (!entry.source || !entry.destination) continue

  const normalizedSource = normalizePath(entry.source)
  sourcePathToDest.set(normalizedSource, entry.destination)

  const destKey = buildDestinationKey(entry.destination)
  if (destKey) {
    const cmsSlug = entry.source.replace(/\/$/, '').split('/').pop()!
    destinationKeyToSlug.set(destKey, cmsSlug)
  }
}

/**
 * CMS → API URL, for de-duplicating the two building routes. Given a CMS building's source
 * path (its WordPress permalink path, e.g. `/seattle-condos/capitol-hill/pike-lofts`), return
 * the exact `/condo-building/…` URL when a Repliers twin exists (the merge case), else null.
 * The map value is the per-tenant destination, so it doubles as the canonical target and the
 * 301 target. Empty destinations (CMS-only buildings) yield null → keep the native path.
 */
export function findCondoBuildingUrl(sourcePath: string): string | null {
  return sourcePathToDest.get(normalizePath(sourcePath)) || null
}

export function findCmsSlugByApiBuilding(
  apiBuilding: {
    name?: string
    buildingName?: string
    details?: { buildingName?: string }
  },
  city: string,
  neighborhood: string
): string | null {
  const buildingName =
    apiBuilding.details?.buildingName ||
    apiBuilding.name ||
    apiBuilding.buildingName
  if (!buildingName) return null

  const key = [city, neighborhood, buildingName].map(slugify).join('/')
  return destinationKeyToSlug.get(key) ?? null
}

export const hasCmsBuildingRedirects = destinationKeyToSlug.size > 0
