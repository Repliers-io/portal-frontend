import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

import { bbox, booleanPointInPolygon } from '@turf/turf'

import type { ApiListing } from 'services/API'
import { resolveListingMarkerColor } from 'utils/listings'
import { polygonFeature } from 'utils/map/polygons'

export type ParcelGroup = {
  /** The parcel's `id` property — the value promoted to the GL feature id. */
  id: string
  /** The parcel polygon itself; the matched layers render from these. */
  feature: Feature<Polygon | MultiPolygon>
  listings: ApiListing[]
  /** Drives the popup and the click. First listing encountered wins. */
  representative: ApiListing
  mlsNumbers: string[]
  color: string
  hoverColor: string
}

/** How the listings on screen were placed. Both passes are counted separately, so a
 *  drop in `geometry` or a spike in `rescued` is visible rather than inferred. */
export type ParcelMatchStats = {
  listings: number
  /** The pin fell inside a parcel. */
  geometry: number
  /** The pin missed, but the listing's street address named a parcel nearby. */
  rescued: number
  unmatched: number
}

type Candidate = {
  id: string
  feature: Feature<Polygon | MultiPolygon>
  box: [number, number, number, number]
}

// Street types and directionals carry no identity: the assessor writes `DR` where
// the MLS writes `Drive`, and either side may keep or drop a leading `S`. Ordinal
// words are the third spelling split — `S Second St` against `2ND ST`.
const streetTypes = new Set([
  'ST',
  'STREET',
  'AVE',
  'AVENUE',
  'DR',
  'DRIVE',
  'RD',
  'ROAD',
  'LN',
  'LANE',
  'BLVD',
  'BOULEVARD',
  'CT',
  'COURT',
  'CV',
  'COVE',
  'WAY',
  'TRL',
  'TRAIL',
  'PL',
  'PLACE',
  'CIR',
  'CIRCLE',
  'PKWY',
  'PARKWAY',
  'TER',
  'TERRACE',
  'HWY',
  'HIGHWAY',
  'PASS',
  'BND',
  'BEND',
  'RUN',
  'PATH',
  'LOOP',
  'XING',
  'CROSSING',
  'PT',
  'POINT',
  'RDG',
  'RIDGE',
  'HOLW',
  'HOLLOW',
  'VW',
  'VIEW',
  'SQ',
  'SQUARE',
  'ROW',
  'WALK',
  'PLZ',
  'PLAZA',
  'EXPY',
  'FWY',
  'SPUR'
])

const directions = new Set([
  'N',
  'S',
  'E',
  'W',
  'NE',
  'NW',
  'SE',
  'SW',
  'NORTH',
  'SOUTH',
  'EAST',
  'WEST'
])

const ordinals: Record<string, string> = {
  FIRST: '1ST',
  SECOND: '2ND',
  THIRD: '3RD',
  FOURTH: '4TH',
  FIFTH: '5TH',
  SIXTH: '6TH',
  SEVENTH: '7TH',
  EIGHTH: '8TH',
  NINTH: '9TH',
  TENTH: '10TH',
  ELEVENTH: '11TH',
  TWELFTH: '12TH'
}

// A fractional house number (`908 1/2 POPLAR ST`) would otherwise tokenise into a
// stray `1 2` and never match its own listing.
const words = (text: unknown): string[] =>
  typeof text === 'string'
    ? text
        .toUpperCase()
        .replace(/\d+\/\d+/g, ' ')
        .replace(/[^A-Z0-9 ]/g, ' ')
        .split(' ')
        .filter(Boolean)
    : []

/**
 * The street name, ending where its type does.
 *
 * Both sides append unit designators to the street itself: the assessor writes
 * `2612 SAN PEDRO ST APT 101`, and the MLS puts `SAN PEDRO ST A-118` inside
 * `streetName`. Cutting at the street type drops all of that without a list of unit
 * markers to keep up to date. Taking the LAST type rather than the first keeps names
 * that contain a type word of their own, like `COURT ST`.
 */
const street = (tokens: string[]): string => {
  const lastType = tokens.reduce(
    (found, word, index) => (streetTypes.has(word) ? index : found),
    -1
  )
  return (lastType === -1 ? tokens : tokens.slice(0, lastType))
    .filter((word) => !streetTypes.has(word) && !directions.has(word))
    .map((word) => ordinals[word] ?? word)
    .join(' ')
}

const addressKey = (number: string, tokens: string[]): string | null => {
  const road = street(tokens)
  return number && road ? `${number}|${road}` : null
}

const listingKey = (listing: ApiListing): string | null => {
  const { streetNumber, streetName } = listing.address ?? {}
  return addressKey(words(streetNumber).join(''), words(streetName))
}

/**
 * Every street address the parcel answers to, as the assessor records them:
 * `3905 GALACIA DR`. A tower collapsed from a stack of unit records carries more
 * than one when it has more than one frontage — `/api/public-record` merges them
 * into `names`, and either should resolve a mispinned listing.
 */
const parcelKeys = (feature: Feature): string[] => {
  const { name, names } = feature.properties ?? {}
  const addresses = Array.isArray(names) ? names : [name]
  return addresses.flatMap((address) => {
    const [number, ...rest] = words(address)
    if (!number || !/^\d/.test(number)) return []
    const key = addressKey(number, rest)
    return key ? [key] : []
  })
}

const metresToBox = (
  [lng, lat]: [number, number],
  [west, south, east, north]: [number, number, number, number]
): number => {
  const perDegreeLat = 111000
  const perDegreeLng = perDegreeLat * Math.cos((lat * Math.PI) / 180)
  const dx = Math.max(west - lng, 0, lng - east) * perDegreeLng
  const dy = Math.max(south - lat, 0, lat - north) * perDegreeLat
  return Math.hypot(dx, dy)
}

/**
 * How far a pin may sit from the parcel its address names. A house number repeats
 * along a long street, so an unguarded key match attaches listings to a segment
 * kilometres away — `603 DAVIS` matched eight times at 1170-1246 m in one sample.
 *
 * Measured over 1234 listings: genuine rescues stop at 115 m, and the next candidate
 * after them is already 265 m out, with a run of street-segment collisions from
 * 305 m up. 150 sits inside that gap and costs one rescue of 54.
 */
const rescueRadius = 150

// Assessor data repeats one footprint across every condo unit standing on it. Left
// as is, a single point matches all of them and the same group is produced N times.
const dedupeByGeometry = (features: Feature[]): Candidate[] => {
  const seen = new Set<string>()
  const candidates: Candidate[] = []
  features.filter(polygonFeature).forEach((feature) => {
    const id = feature.properties?.id
    if (typeof id !== 'string') return
    const key = JSON.stringify(feature.geometry)
    if (seen.has(key)) return
    seen.add(key)
    const [west, south, east, north] = bbox(feature)
    candidates.push({
      id,
      feature: feature as Feature<Polygon | MultiPolygon>,
      box: [west, south, east, north]
    })
  })
  return candidates
}

const inBox = (
  [lng, lat]: [number, number],
  [west, south, east, north]: [number, number, number, number]
) => lng >= west && lng <= east && lat >= south && lat <= north

/**
 * Assigns every listing to the parcel its coordinates fall inside, then makes a
 * second attempt for the ones that missed.
 *
 * Agents drop pins on the road often enough to matter — 17 of 227 listings across
 * ten Austin viewports — and the assessor's own street address recovers most of
 * them: matching the house number and the street name, with types, directionals and
 * ordinal spellings normalised away, rescued 11 of those 17 and never matched two
 * parcels at once. Listings that neither pass places come back untouched.
 */
export const groupListingsByParcel = (
  listings: ApiListing[],
  parcels: FeatureCollection | undefined
): {
  groups: ParcelGroup[]
  unmatched: ApiListing[]
  stats: ParcelMatchStats
} => {
  const candidates = parcels ? dedupeByGeometry(parcels.features) : []
  const unmatched: ApiListing[] = []
  const byParcel = new Map<string, ApiListing[]>()
  const missed: { listing: ApiListing; point: [number, number] }[] = []
  let geometry = 0
  let rescued = 0

  const place = (id: string, listing: ApiListing) => {
    const members = byParcel.get(id)
    if (members) members.push(listing)
    else byParcel.set(id, [listing])
  }

  listings.forEach((listing) => {
    const lng = Number(listing.map?.longitude)
    const lat = Number(listing.map?.latitude)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      unmatched.push(listing)
      return
    }
    const point: [number, number] = [lng, lat]
    const hit = candidates.find(
      ({ box, feature }) =>
        inBox(point, box) && booleanPointInPolygon(point, feature)
    )
    if (hit) {
      place(hit.id, listing)
      geometry += 1
    } else missed.push({ listing, point })
  })

  if (missed.length) {
    const byAddress = new Map<string, Candidate[]>()
    candidates.forEach((candidate) => {
      parcelKeys(candidate.feature).forEach((key) => {
        const bucket = byAddress.get(key)
        if (bucket) bucket.push(candidate)
        else byAddress.set(key, [candidate])
      })
    })

    missed.forEach(({ listing, point }) => {
      const key = listingKey(listing)
      const nearest = (key ? (byAddress.get(key) ?? []) : [])
        .map((candidate) => ({
          candidate,
          distance: metresToBox(point, candidate.box)
        }))
        .filter(({ distance }) => distance <= rescueRadius)
        .sort((a, b) => a.distance - b.distance)[0]

      if (nearest) {
        place(nearest.candidate.id, listing)
        rescued += 1
      } else unmatched.push(listing)
    })
  }

  // Walk the candidates, not the map, so the groups keep the parcel order and each
  // one carries its own polygon.
  const groups = candidates.flatMap(({ id, feature }) => {
    const members = byParcel.get(id)
    if (!members) return []
    const representative = members[0]
    const { color, hoverColor } = resolveListingMarkerColor({
      listing: representative
    })
    return [
      {
        id,
        feature,
        listings: members,
        representative,
        mlsNumbers: members.map((l) => l.mlsNumber),
        color,
        // The resolver always fills it, but the type keeps it optional.
        hoverColor: hoverColor ?? color
      }
    ]
  })

  return {
    groups,
    unmatched,
    stats: {
      listings: listings.length,
      geometry,
      rescued,
      unmatched: unmatched.length
    }
  }
}
