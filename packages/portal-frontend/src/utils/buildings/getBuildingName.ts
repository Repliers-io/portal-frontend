import { type ApiBuilding, type ApiListingAddress } from 'services/API'
import { formatFullAddress } from 'utils/listings'

/**
 * Extract building name with priority: details.buildingName > name > buildingName
 */
export function getBuildingName(building: ApiBuilding): string | undefined {
  return (
    building.details?.buildingName || building.name || building.buildingName
  )
}

/**
 * Human-facing label for a building: its name, or its full address when unnamed.
 */
export function getBuildingLabel(building: ApiBuilding): string {
  const name = getBuildingName(building)
  if (name) return name

  return building.address
    ? formatFullAddress(building.address as Partial<ApiListingAddress>, true)
    : ''
}
