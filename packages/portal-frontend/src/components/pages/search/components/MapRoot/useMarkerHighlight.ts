import { useCallback, useEffect, useRef } from 'react'

import { useParcelGroups } from '@shared/Map/hooks/useParcelListings'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { markersActive } from 'utils/listings'
import { parcelMatchedSourceId, setHoverState } from 'utils/map'

// Bridges grid-card hover to the map: hovering a list card adds `.active` to the
// matching marker element (the same class its own `:hover` uses), lighting the ring
// + recolor, and sets `hover` on the parcel the listing sits on. Clears any lingering
// highlight when results change.
const clearActive = (): void =>
  document
    .querySelectorAll('.lm.active')
    .forEach((el) => el.classList.remove('active'))

// The parcel lit by the last card hover. Module-wide, like the `.active` class it
// pairs with: the grid's instance lights it, the dialog's instance clears it.
let litParcel: string | null = null

export const useMarkerHighlight = () => {
  const { filters } = useSearch()
  const { mapRef } = useMapOptions()
  // Read inside the callbacks, which stay stable across parcel refetches.
  const { parcelOf } = useParcelGroups()
  const parcelOfRef = useRef(parcelOf)
  parcelOfRef.current = parcelOf

  const leaveMarker = useCallback(() => {
    clearActive()
    const map = mapRef.current
    if (map && litParcel)
      setHoverState(map, parcelMatchedSourceId, litParcel, false)
    litParcel = null
  }, [mapRef])

  const hoverMarker = useCallback(
    (mlsNumber: string) => {
      leaveMarker()
      markersActive([mlsNumber], true)
      const map = mapRef.current
      const parcel = parcelOfRef.current.get(mlsNumber)
      if (!map || !parcel) return
      setHoverState(map, parcelMatchedSourceId, parcel, true)
      litParcel = parcel
    },
    [leaveMarker, mapRef]
  )

  useEffect(() => leaveMarker(), [filters, leaveMarker])

  return { hoverMarker, leaveMarker }
}
