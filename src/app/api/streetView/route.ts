import { NextResponse } from 'next/server'

import { APIEstimate } from 'services/API'
import { getFullAddress, getStreetViewImageUrl } from 'utils/street-view'

import { createErrorImageResponse } from './utils'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const estimateId = Number(searchParams.get('estimateId'))
  const ulid = searchParams.get('ulid')
  const size = searchParams.get('size') || '600x400'
  const [width, height] = size.split('x').map(Number)

  if (!ulid && !estimateId) {
    return createErrorImageResponse(width, height, 400)
  }

  try {
    const data = await APIEstimate.fetchEstimate(
      ulid || estimateId,
      Boolean(ulid)
    )

    if (!data || !data.payload)
      return createErrorImageResponse(width, height, 404)

    const options = { size }
    const { map, address } = data.payload
    const fullAddress = getFullAddress(address)

    const imageUrl = getStreetViewImageUrl(fullAddress, map, options)

    // Fetch the image from the imageUrl
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok)
      return createErrorImageResponse(width, height, imageResponse.status)

    const imageBlob = await imageResponse.blob()
    const imageContentType =
      imageResponse.headers.get('Content-Type') || 'image/jpeg'

    return new NextResponse(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': imageContentType,
        'Cache-Control': 'public, max-age=86400' // Cache for 1 day
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return createErrorImageResponse(width, height, 503)
  }
}
