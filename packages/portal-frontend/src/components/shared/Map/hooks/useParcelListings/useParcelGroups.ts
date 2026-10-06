'use client'

import { useMemo } from 'react'

import { useMapLayers } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { parcelsOverlayId } from 'utils/map/parcelLayers'

import { groupListingsByParcel, type ParcelGroup } from './grouping'

const noGroups: ParcelGroup[] = []

/**
 * The single call site for the parcel grouping: the parcel layers draw `groups`, and
 * the marker and grid-card hovers read `parcelOf` to light the parcel under a listing.
 *
 * With the mode off, or before any parcel data is published, there are no groups.
 */
export const useParcelGroups = () => {
  const { listings } = useSearch()
  const { activeLayers, layerData, loadingLayers } = useMapLayers()
  // Switching the parcels layer on IS the mode: there is no second control.
  const active = activeLayers.has(parcelsOverlayId)
  const parcels = active ? layerData[parcelsOverlayId] : undefined

  // "No parcels" and "the parcels have not arrived yet" are different answers: while
  // the fetch is in flight the groups would be computed against the previous
  // viewport's parcels. While `pending` is true the caller holds its previous frame.
  const pending = active && loadingLayers.has(parcelsOverlayId)

  const groups = useMemo(
    () =>
      parcels ? groupListingsByParcel(listings, parcels).groups : noGroups,
    [listings, parcels]
  )

  // The parcel each listing sits on, by mlsNumber.
  const parcelOf = useMemo(() => {
    const byListing = new Map<string, string>()
    groups.forEach((group) => {
      group.mlsNumbers.forEach((mlsNumber) =>
        byListing.set(mlsNumber, group.id)
      )
    })
    return byListing
  }, [groups])

  return { groups, parcelOf, pending }
}
