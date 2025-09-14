const toRad = (deg: number) => deg * (Math.PI / 180)
const toDeg = (rad: number) => rad * (180 / Math.PI)

export type Location = { lat: number; lng: number }

export const getHeading = (point1: Location, point2: Location, headX = 0) => {
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
