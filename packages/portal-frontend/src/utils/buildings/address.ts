import { type ApiBuilding } from 'services/API'

// The address filter shared by a building's listing sections. Repliers sometimes
// folds the street direction into a building's streetNumber ("10700 NE"), which
// matches almost no listing, so only the leading house number is kept.
export const buildingAddressFilter = ({ address }: ApiBuilding) => {
  const { streetNumber, streetName, city, neighborhood } = address || {}
  return {
    streetNumber: streetNumber?.match(/^\d+/)?.[0] ?? streetNumber,
    streetName,
    city,
    neighborhood
  }
}
