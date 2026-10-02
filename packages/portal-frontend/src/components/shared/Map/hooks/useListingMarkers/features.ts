import { markerColors } from '@configs/colors'
import { type MarkerSize } from '@shared/Map'
import { type MarkerKind } from '@shared/Map/markerElement'

import { type ApiCluster, type ApiListing } from 'services/API'
import { formatPrice } from 'utils/formatters'
import {
  displayOnMap,
  getMarkerLabel,
  type ListingMarkerColor,
  resolveListingMarkerColor,
  scrubbed
} from 'utils/listings'

// A plain description of one marker to render. The manager diffs these by `key`
// and only creates/removes the DOM markers that actually changed.
export type MarkerDescriptor = {
  key: string
  kind: MarkerKind
  lng: number
  lat: number
  label: string
  color: string
  hoverColor?: string
  // listing markers
  listing?: ApiListing
  mlsNumber?: string
  // every same-address mlsNumber a multi-unit marker stands in for, so hover
  // can highlight the whole group's grid cards at once
  mlsNumbers?: string[]
  multiUnit?: boolean
  // cluster markers — corner scalars to fitBounds on click
  bounds?: {
    westLng: number
    northLat: number
    eastLng: number
    southLat: number
  }
}

const muKey = (listing: ApiListing): string => {
  const { streetName, streetNumber, city } = listing.address
  return `${streetName}-${streetNumber}-${city}`.toLowerCase()
}

// Commercial/Residential listings are never grouped — each shows its own marker
// (mirrors the legacy MarkerExtension.putUniqueProperty).
const groupable = (listing: ApiListing): boolean =>
  listing.class !== 'CommercialProperty' &&
  listing.class !== 'ResidentialProperty'

type AddressGroup = { listing: ApiListing; mlsNumbers: string[] }

// Group same-address listings; the first listing encountered is the group's
// representative marker (matches the legacy "first wins" behaviour). Members
// are collected so a multi-unit marker can highlight all their grid cards.
const buildGroups = (listings: ApiListing[]): Record<string, AddressGroup> => {
  const groups: Record<string, AddressGroup> = {}
  listings.forEach((listing) => {
    if (!groupable(listing)) return
    const key = muKey(listing)
    if (groups[key]) groups[key].mlsNumbers.push(listing.mlsNumber)
    else groups[key] = { listing, mlsNumbers: [listing.mlsNumber] }
  })
  return groups
}

export const listingDescriptors = (
  listings: ApiListing[],
  size: MarkerSize
): MarkerDescriptor[] => {
  const kind: MarkerKind = size === 'point' ? 'dot' : 'pill'
  const onMap = listings.filter(displayOnMap)
  const groups = buildGroups(onMap)
  const renderedGroups = new Set<string>()
  const descriptors: MarkerDescriptor[] = []

  onMap.forEach((listing) => {
    const group = groupable(listing) ? groups[muKey(listing)] : undefined
    const multiUnit = group ? group.mlsNumbers.length > 1 : false

    if (multiUnit) {
      const key = muKey(listing)
      if (renderedGroups.has(key)) return
      renderedGroups.add(key)
    }

    const { mlsNumber, listPrice, map } = listing
    const label = multiUnit
      ? `${group!.mlsNumbers.length} units`
      : !scrubbed(listPrice)
        ? formatPrice(listPrice)
        : getMarkerLabel(listing)

    const { color, hoverColor } = resolveListingMarkerColor({ listing })

    descriptors.push({
      // size in the key so crossing the point/tag zoom rebuilds the markers.
      key: `${size}:${mlsNumber}`,
      kind,
      lng: Number(map.longitude),
      lat: Number(map.latitude),
      label,
      color,
      hoverColor,
      listing,
      mlsNumber,
      // multi-unit markers carry the whole group so hover lights every card
      mlsNumbers: multiUnit ? group!.mlsNumbers : undefined,
      multiUnit
    })
  })

  return descriptors
}

// Stable key per cluster — same shape as the legacy getClusterKey so identity
// survives re-fetches at the same camera position.
const clusterKey = (cluster: ApiCluster): string =>
  `c-${cluster.count}-lat-${cluster.location.latitude}-lng-${cluster.location.longitude}`

const clusterBounds = (cluster: ApiCluster) => ({
  // top_left = north-west corner, bottom_right = south-east corner
  westLng: Number(cluster.bounds.top_left.longitude),
  northLat: Number(cluster.bounds.top_left.latitude),
  eastLng: Number(cluster.bounds.bottom_right.longitude),
  southLat: Number(cluster.bounds.bottom_right.latitude)
})

const clusterDescriptor = (
  cluster: ApiCluster,
  colors: ListingMarkerColor = markerColors.default
): MarkerDescriptor => {
  const { location, count } = cluster
  return {
    key: clusterKey(cluster),
    kind: 'cluster',
    lng: Number(location.longitude),
    lat: Number(location.latitude),
    label: String(count),
    color: colors.color,
    hoverColor: colors.hoverColor,
    bounds: clusterBounds(cluster)
  }
}

// Cluster-mode descriptors with clusterListingsThreshold in effect: clusters
// above the threshold stay circles, smaller ones arrive with their listings
// inlined in full card shape (clusterFields) — those run through the regular
// listingDescriptors pipeline and render as individual markers at their own
// coordinates, mixed in with the circles. Listing keys share one namespace
// with the listing mode, so crossing the count boundary diffs the markers
// instead of clearing the whole set.
export const mixedDescriptors = (
  clusters: ApiCluster[],
  size: MarkerSize,
  clusterColor: ListingMarkerColor = markerColors.default
): MarkerDescriptor[] => {
  const inlined = clusters.flatMap((cluster) => cluster.listings ?? [])
  return [
    ...clusters
      .filter((cluster) => !cluster.listings?.length)
      .map((cluster) => clusterDescriptor(cluster, clusterColor)),
    ...listingDescriptors(inlined, size)
  ]
}
