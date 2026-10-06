import { type LngLat } from 'mapbox-gl'

const toRad = (deg: number) => deg * (Math.PI / 180)
const toDeg = (rad: number) => rad * (180 / Math.PI)

export const calculateDistance = (
  location1: Pick<LngLat, 'lat' | 'lng'>,
  location2: Pick<LngLat, 'lat' | 'lng'>
) => {
  if (!location1 || !location2) return 9999999

  const R = 6371 // Earth radius in km
  const dLat = toRad(location2.lat - location1.lat)
  const dLon = toRad(location2.lng - location1.lng)
  const lat1 = toRad(location1.lat)
  const lat2 = toRad(location2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const getHeading = (point1: LngLat, point2: LngLat, headX = 0) => {
  const { lat: lat1, lng: lng1 } = point1
  const { lat: lat2, lng: lng2 } = point2
  // Convert latitude and longitude differences to radians
  // const deltaLat = toRad(lat2 - lat1)
  const deltaLon = toRad(lng2 - lng1)

  // Convert initial and final latitudes to radians
  const radLat1 = toRad(lat1)
  const radLat2 = toRad(lat2)

  // Calculate intermediate values for heading/bearing calculation
  const y = Math.sin(deltaLon) * Math.cos(radLat2)
  const x =
    Math.cos(radLat1) * Math.sin(radLat2) -
    Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(deltaLon)

  // Calculate bearing in radians and convert to degrees
  let heading = toDeg(Math.atan2(y, x))

  // Adjust bearing to be in the range of 0 to 360 degrees
  if (heading < 0) {
    heading = 360 + heading
  }

  // Subtract optional heading adjustment and ensure the result is within 0 to 360 degrees
  heading = (heading - headX + 360) % 360
  heading = Number.isFinite(heading) ? heading : 0

  return Math.floor(heading)
}
