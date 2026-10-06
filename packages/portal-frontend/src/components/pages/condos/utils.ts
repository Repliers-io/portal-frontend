import locationConfig from '@configs/location'
import routes from '@configs/routes'

import { type ApiBuilding, type ApiBuildingAddress } from 'services/API'
import { getBuildingName } from 'utils/buildings'
import { formatFullAddress, sanitizeAddress } from 'utils/listings'
import { sanitizeUrl } from 'utils/urls'

interface LocationBuildingsUrlParams {
  area?: string
  city?: string
  hood?: string
  slug?: string
  buildingName?: string
}

/**
 * Generate subtitle for building based on whether it has a proper name
 * - With proper name: full address
 * - Without proper name: neighborhood, city, state, zip, country
 */
export function getBuildingSubtitle(
  address: ApiBuildingAddress | undefined,
  hasProperName: boolean
): string {
  if (!address) return ''

  if (hasProperName) {
    return formatFullAddress(address as any)
  }

  const { neighborhood, city, state, zip, country } = address
  return [neighborhood, city, state, String(zip).toUpperCase(), country]
    .filter(Boolean)
    .join(', ')
}

/**
 * Build a URL within the location buildings tree.
 * Without `slug` → buildings index (`/condos/…`).
 * With `slug` → single building detail (`/condo/…/slug`).
 */
export function getLocationBuildingsUrl({
  area,
  city,
  hood,
  slug,
  buildingName
}: LocationBuildingsUrlParams = {}): string {
  const parts: string[] = []
  if (area && locationConfig.showAreas) parts.push(`${sanitizeUrl(area)}-area`)
  if (city) parts.push(sanitizeUrl(city))
  if (hood) parts.push(sanitizeUrl(hood))
  // slug is already sanitized by sanitizeAddress, don't double-encode it
  if (slug) parts.push(slug)
  if (buildingName) parts.push(sanitizeUrl(buildingName))

  const base = slug ? routes.condo : routes.condos
  return `${base}/${parts.join('/')}`
}

/**
 * Build a direct URL to a single building page.
 * Accepts optional area/city/hood overrides; falls back to building.address fields.
 * Appends building name as 4th URL segment when available.
 */
export function getBuildingUrl(
  building: ApiBuilding,
  params: { area?: string; city?: string; hood?: string } = {}
): string {
  const { id, slug, address } = building
  const { streetNumber, streetName, city, neighborhood, area } = address || {}

  const addressSlug =
    slug || sanitizeAddress({ streetNumber, streetName } as any)
  const displaySlug = id ? `${addressSlug}-${id}` : addressSlug

  return getLocationBuildingsUrl({
    area: params.area || area,
    city: params.city || city,
    hood: params.hood || neighborhood,
    slug: displaySlug,
    buildingName: getBuildingName(building)
  })
}
