'use client'

import { useParcelPolygon } from '@shared/Map/hooks/useParcelListings'

import { useParcel } from 'providers/ParcelProvider'

/**
 * Draws the listing's parcel on the address map as a leaf that renders nothing, the
 * way `OverlayLayersController` runs the overlay sync on the search map.
 *
 * Mounted inside the interactive map's provider only: the static variant is a
 * background image with no GL layers to draw into, and it reads the page-level
 * provider — drawing there would land the parcel on the search map.
 */
export const ListingParcelLayer = () => {
  const { parcel } = useParcel()
  useParcelPolygon(parcel)
  return null
}
