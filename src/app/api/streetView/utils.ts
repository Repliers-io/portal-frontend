import { NextResponse } from 'next/server'

import HouseIcon from 'assets/common/house.svg'

export const createErrorImageResponse = (
  width: number,
  height: number,
  statusCode: number
): NextResponse => {
  // Directly use the src property, assuming it's a data URI string
  // This is a common pattern for SVG imports in Next.js (e.g., via @svgr/webpack)
  const houseSvgDataUri = (HouseIcon as any).src

  const imgWidth = 130
  const imgHeight = 130
  const imgX = (width - imgWidth) / 2
  const imgY = (height - imgHeight) / 2

  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect width="100%" height="100%" fill="#DDDDDD"/>
      <image x="${imgX}" y="${imgY}" width="${imgWidth}" height="${imgHeight}" xlink:href="${houseSvgDataUri}"/>
      <text x="10" y="${height - 10}" font-family="Arial" font-size="16" fill="#D0D0D0">${statusCode}</text>
    </svg>
  `

  return new NextResponse(svgContent, {
    status: statusCode,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
