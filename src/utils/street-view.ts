/* eslint-disable @typescript-eslint/no-unused-vars */
import queryString from 'query-string'

import { gmapsApiKey as key, gmapsApiUrl as api } from '@configs/api'

import { type PropertyAddress } from 'services/API'
import { getHeading, type Location } from 'utils/geo'
import { formatFullAddress, sanitizeStreetNumber } from 'utils/properties'

const gmapsDomain = 'https://www.google.com/maps/@?api=1'

export type MapCoordinates = {
  latitude: number | string
  longitude: number | string
}

export type StreetViewOptions = {
  radius?: number
  size?: string
  cardWidth?: number
}

export const getFullAddress = (
  address: Partial<PropertyAddress>
): PropertyAddress => {
  return {
    area: '',
    city: '',
    country: '',
    district: '',
    majorIntersection: '',
    neighborhood: '',
    streetDirection: '',
    streetName: '',
    streetNumber: '',
    streetSuffix: '',
    unitNumber: '',
    zip: '',
    state: '',
    communityCode: '',
    streetDirectionPrefix: '',
    ...address
  }
}

export const getStreetViewImageUrl = (
  address: PropertyAddress,
  coordinates: MapCoordinates,
  options: StreetViewOptions = {}
): string => {
  const coordsFallback = sanitizeStreetNumber(address.streetNumber) === ''
  const location = coordsFallback
    ? `${coordinates.latitude},${coordinates.longitude}`
    : formatFullAddress(address)

  const radius = options.radius || 200
  const cardWidth = options.cardWidth || 192
  const size = options.size || `${cardWidth}x${Math.ceil((cardWidth * 2) / 3)}`

  const params = queryString.stringify({
    key,
    size,
    radius,
    location
  })

  return `${api}streetview?${params}`
}

const fetchAddressMetadata = async (
  address: PropertyAddress,
  radius: number
) => {
  const location = encodeURIComponent(formatFullAddress(address))

  const [geocodeResponse, metadataResponse] = await Promise.all([
    fetch(`${api}geocode/json?address=${location}&key=${key}`),
    fetch(
      `${api}streetview/metadata?location=${location}&radius=${radius}&key=${key}`
    )
  ])

  const [geocodeData, metadataData] = await Promise.all([
    geocodeResponse.json(),
    metadataResponse.json()
  ])

  if (geocodeData.status !== 'OK' || metadataData.status !== 'OK')
    throw Error('Failed to fetch address metadata')

  return {
    mapPoint: geocodeData.results[0]?.geometry?.location,
    streetViewPoint: metadataData.location
  }
}

const fetchCoordinateMetadata = async (point: Location, radius: number) => {
  const metadataRes = await fetch(
    `${api}streetview/metadata?location=${point.lat},${point.lng}&radius=${radius}&key=${key}`
  )
  const metadataData = await metadataRes.json()

  if (metadataData.status !== 'OK') throw Error('No street view data')
  return { streetViewPoint: metadataData.location }
}

export const getStreetViewLink = async (
  address: PropertyAddress,
  coordinates: MapCoordinates,
  options: StreetViewOptions = {}
): Promise<string> => {
  const radius = options.radius || 200
  const propertyPoint = {
    lat: Number(coordinates.latitude),
    lng: Number(coordinates.longitude)
  }

  // Fallback case 1: Determine if we should use coordinates directly
  // (when street number is empty or invalid)
  const coordsFallback = sanitizeStreetNumber(address.streetNumber || '') === ''

  try {
    let streetViewLocation: Location
    let targetLocation = propertyPoint

    if (coordsFallback) {
      // CASE 1A: Direct coordinates fallback path
      // -----------------------------------------
      // When we don't have valid street number, skip address lookup
      // and try to find street view near property coordinates
      const coordinateMetadata = await fetchCoordinateMetadata(
        propertyPoint,
        radius
      )
      streetViewLocation = coordinateMetadata.streetViewPoint
    } else {
      // CASE 1B: Primary address-based lookup path
      // ------------------------------------------
      try {
        // First try: Get precise location using full address
        const addressMetadata = await fetchAddressMetadata(address, radius)

        // Use either geocoded point (from address) or original coordinates
        targetLocation = addressMetadata.mapPoint || propertyPoint
        streetViewLocation = addressMetadata.streetViewPoint
      } catch (addressError) {
        // Fallback case 2: Address lookup failed
        // --------------------------------------
        // Attempt to find street view data using original coordinates
        // when address-based search fails
        try {
          const coordinateMetadata = await fetchCoordinateMetadata(
            propertyPoint,
            radius
          )
          streetViewLocation = coordinateMetadata.streetViewPoint
        } catch (coordinateError) {
          // Fallback case 3: Both methods failed
          // -----------------------------------
          // Use basic coordinates without street view metadata
          throw new Error('All lookup methods failed')
        }
      }
    }

    // Calculate camera orientation
    // ----------------------------
    // Heading is calculated FROM the street view location TO the target property
    // This ensures the camera faces towards the property
    const heading = getHeading(streetViewLocation, targetLocation)

    // Build final URL with calculated parameters
    const params = queryString.stringify({
      heading,
      fov: 60,
      map_action: 'pano',
      viewpoint: `${streetViewLocation.lat},${streetViewLocation.lng}`
    })

    return `${gmapsDomain}&${params}`
  } catch (finalError) {
    // Ultimate fallback case
    // ----------------------
    // When all methods fail, return basic coordinates panorama
    // This ensures we always return a valid URL even with poor data
    const params = queryString.stringify({
      map_action: 'pano',
      viewpoint: `${propertyPoint.lat},${propertyPoint.lng}`
    })
    return `${gmapsDomain}&${params}`
  }
}
