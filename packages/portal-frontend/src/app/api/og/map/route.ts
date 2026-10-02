import { NextResponse } from 'next/server'

import mapConfig from '@configs/map'
import { type MapStyle } from '@defaults/map'

import { getMapboxStaticImageUrl, getOrientation } from 'utils/map'
import { getProtocolHost } from 'utils/urls'

// getMapboxStaticImageUrl always appends @2x — pass half-size so the
// rendered output is exactly the recommended OG dimensions (1200×630)
const imageWidth = 600
const imageHeight = 315

// The static API rejects pitch above 60 (interactive maps allow more)
const staticPitchMax = 60

const finiteInRange = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max

/**
 * OpenGraph map image proxy (modeled on /api/streetView): builds a Mapbox
 * static image for the shared map viewport and serves it from our domain,
 * keeping the messenger crawler traffic cacheable on our side.
 */
export const GET = async (request: Request) => {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl

  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  const z = Number(searchParams.get('z'))

  if (!finiteInRange(lat, -90, 90) || !finiteInRange(lng, -180, 180)) {
    return new NextResponse(null, { status: 400 })
  }

  // Style must pass the allowlist — the value ends up in the Mapbox style URL
  const ms = searchParams.get('ms')
  const style = ms && ms in mapConfig.mapStyles ? (ms as MapStyle) : 'map'

  // Same `3d=bearing,pitch` format as the map page URL
  const orientation = getOrientation(searchParams)

  const imageUrl = getMapboxStaticImageUrl({
    point: { longitude: lng, latitude: lat },
    zoom: finiteInRange(z, 0, 22) ? z : mapConfig.mapboxDefaults.zoom!,
    width: imageWidth,
    height: imageHeight,
    style,
    ...(orientation && {
      bearing: orientation.bearing,
      pitch: Math.min(orientation.pitch, staticPitchMax)
    })
  })
  // TODO: overlay listing markers / price labels via the static-API GeoJSON
  // overlay once a cheap server-side listings fetch is decided (counts stub)

  try {
    // Pass Referer so Mapbox token URL-restrictions accept the server-side request.
    // getProtocolHost reads x-forwarded-proto/host so we get the actual public
    // origin rather than the internal hostname Next.js sees behind a reverse proxy.
    const referer = getProtocolHost(request.headers as unknown as Headers)
    const imageResponse = await fetch(imageUrl, {
      headers: { Referer: referer }
    })
    if (!imageResponse.ok) {
      return new NextResponse(null, { status: imageResponse.status })
    }

    const imageBlob = await imageResponse.blob()
    const imageContentType =
      imageResponse.headers.get('Content-Type') || 'image/png'

    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': imageContentType,
        'Cache-Control': 'public, max-age=86400' // Cache for 1 day
      }
    })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
