/**
 * Owns the public-record parcel the listing stands on: one fetch, shared by the
 * address map (which draws the polygon) and the Public Facts section (which reads the
 * assessor record). Exposes `useParcel` (read).
 */
'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import type { Feature, MultiPolygon, Polygon } from 'geojson'

import { groupListingsByParcel } from '@shared/Map/hooks/useParcelListings'

import { ListingContext } from 'providers/ListingProvider'
import type { ParcelRecord } from 'utils/dataMapper/parcelMappers'
import { displayOnMap } from 'utils/listings'
import { getPointBounds } from 'utils/map/bounds'
import { fetchParcelsWithRecord, overlayById } from 'utils/map/overlays'
import { parcelsOverlayId } from 'utils/map/parcelLayers'

export type ParcelFeature = Feature<Polygon | MultiPolygon>

type ParcelContextProps = {
  parcel: ParcelFeature | null
  record: ParcelRecord | null
}

// The tenant gate: false unless this tenant's parcels overlay is the one backed by the
// Repliers public record, so nothing is fetched, drawn or rendered anywhere else. The
// id is not enough — movesmartly draws an overlay of the same name from its own
// Ontario parcel service, which carries no assessor record.
const parcelsOverlay = overlayById(parcelsOverlayId)
const publicRecordParcels = Boolean(parcelsOverlay?.publicRecord)

// A box around the pin rather than the map viewport, so the parcel is found wherever
// the map has been panned. `/locations?map=` answers with every parcel the rectangle
// touches, so the containing parcel needs no margin — 200 m is for the address rescue,
// which looks for named parcels out to `rescueRadius` (150 m) when the pin fell on the
// road.
const radius = 0.2

/** The overlay's parcel again, carrying its assessor record. */
export const fetchParcelRecord = async (
  parcel: ParcelFeature,
  signal: AbortSignal
): Promise<ParcelFeature | undefined> => {
  const { id, longitude, latitude } = parcel.properties ?? {}
  const collection = await fetchParcelsWithRecord(
    getPointBounds({ center: [Number(latitude), Number(longitude)], radius }),
    signal
  )
  return collection.features.find(
    (feature) => feature.properties?.id === id
  ) as ParcelFeature | undefined
}

const ParcelContext = createContext<ParcelContextProps>({
  parcel: null,
  record: null
})

const ParcelProvider = ({
  target,
  children
}: {
  /** A parcel that already carries its record (the parcel dialog fetches it before
   *  opening). Without it, the parcel is the one the listing stands on. */
  target?: ParcelFeature
  children: React.ReactNode
}) => {
  const listing = useContext(ListingContext)?.listing
  const [fetched, setFetched] = useState<ParcelFeature | null>(null)
  const parcel = target ?? fetched

  const lng = Number(listing?.map?.longitude)
  const lat = Number(listing?.map?.latitude)

  useEffect(() => {
    if (target || !publicRecordParcels || !listing || !displayOnMap(listing))
      return
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
    const controller = new AbortController()

    fetchParcelsWithRecord(
      getPointBounds({ center: [lat, lng], radius }),
      controller.signal
    )
      .then((collection) => {
        // The matcher the search map uses, so a pin dropped on the road still lands
        // on the parcel its address names, and a condo tower's stacked records
        // collapse to the one footprint.
        const [group] = groupListingsByParcel([listing], collection).groups
        setFetched(group?.feature ?? null)
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== 'AbortError')
          console.error('[ParcelProvider]', error)
      })

    return () => controller.abort()
  }, [target, listing, lng, lat])

  const contextValue = useMemo(
    () => ({
      parcel,
      record: (parcel?.properties?.publicRecord ?? null) as ParcelRecord | null
    }),
    [parcel]
  )

  return (
    <ParcelContext.Provider value={contextValue}>
      {children}
    </ParcelContext.Provider>
  )
}

export const useParcel = () => useContext(ParcelContext)

export default ParcelProvider
