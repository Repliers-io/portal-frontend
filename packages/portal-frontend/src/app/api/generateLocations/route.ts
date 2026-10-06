import { type NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

import defaultLocationConfig from '@defaults/location'

import { buildProductionTree, toCacheFile } from 'services/LocationsTree'

async function generateLocationsFile() {
  const { areaThreshold } = defaultLocationConfig

  const result = await buildProductionTree({
    debug: false,
    hideTrash: true,
    sortByCount: true,
    fetchAllCounts: true,
    skipNeighborhoods: false,
    areaThreshold
  })

  const { tree, metadata, stats } = result

  const output = toCacheFile(tree.areas, { metadata, stats })

  const instance = process.env.NEXT_PUBLIC_APP_CONFIGURATION || 'defaults'
  const outputDir = path.resolve(process.cwd(), 'public', instance)
  fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'locations.json')
  fs.writeFileSync(outputPath, JSON.stringify(output))

  const fileSizeKb = Math.round(fs.statSync(outputPath).size / 1024)
  const fileUrl = `/${instance}/locations.json`

  return { output, tree, metadata, fileSizeKb, fileUrl, areaThreshold }
}

/**
 * API route for regenerating the locations tree JSON file on demand.
 *
 * Authentication: pass `?token=<LOCATIONS_REGEN_TOKEN>` query param.
 * Set LOCATIONS_REGEN_TOKEN in the tenant .env file.
 * If the env var is not set, the endpoint is disabled.
 *
 * Modes:
 *   GET /api/generatelocations?token=<secret>
 *     → streams newline-delimited JSON progress events; final event includes fileUrl
 *   GET /api/generatelocations?token=<secret>&output=file
 *     → generates synchronously and returns the locations.json content directly
 */
export async function GET(request: NextRequest) {
  const expectedToken = process.env.LOCATIONS_REGEN_TOKEN

  if (!expectedToken) {
    return NextResponse.json(
      { error: 'Location regeneration is not configured on this instance.' },
      { status: 503 }
    )
  }

  const { searchParams } = request.nextUrl
  const token = searchParams.get('token')

  if (!token || token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const outputMode = searchParams.get('output')

  if (outputMode === 'file') {
    try {
      const { output } = await generateLocationsFile()
      return NextResponse.json(output, {
        headers: {
          'Content-Disposition': 'attachment; filename="locations.json"',
          'Cache-Control': 'no-store'
        }
      })
    } catch (error) {
      console.error('[generateLocations]', error)
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }
  }

  const startTime = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(data) + '\n')
        )

      try {
        const { areaThreshold } = defaultLocationConfig
        send({ status: 'started', areaThreshold })

        const { tree, metadata, fileSizeKb, fileUrl } =
          await generateLocationsFile()

        const elapsed = Date.now() - startTime

        send({
          status: 'done',
          ok: true,
          elapsed,
          fileSizeKb,
          fileUrl,
          areas: tree.areas.length,
          cities: tree.areas.reduce(
            (s: number, a: { cities?: unknown[] }) =>
              s + (a.cities?.length ?? 0),
            0
          ),
          metadata
        })
      } catch (error) {
        console.error('[generateLocations]', error)
        send({ status: 'error', ok: false, error: String(error) })
      } finally {
        controller.close()
      }
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-store'
    }
  })
}
