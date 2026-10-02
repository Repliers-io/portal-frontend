import { Stack } from '@mui/material'

import mapConfig from '@configs/map'
import { useLocationSelection } from '@shared/Map/hooks/useLocationSelection'
import { overlayForLocation } from '@shared/Map/hooks/useOverlaySelectsLocation'

import { type ApiLocation } from 'services/API'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { setHoverFeatureState, setPreviewFeatureState } from 'utils/map'
import {
  overlayAccent,
  overlayMarkerDomId,
  overlayPolygonId
} from 'utils/map/overlays'
import { capitalize } from 'utils/strings'

import { useLocationClick } from './hooks/useLocationClick'
import { LocationChip } from './components'

const { overlays } = mapConfig

// Light the location's overlay marker ring on chip hover — the same `.lm.active`
// affordance the marker uses on its own hover (and grid cards use on the listing
// markers). No-op when the marker is clustered or its layer is off (no element).
const overlayMarkerActive = (locationId: string, active: boolean): void => {
  document
    .getElementById(overlayMarkerDomId(locationId))
    ?.classList.toggle('active', active)
}

// Flat list of the selected locations as removable chips (replaces the
// area→city→neighborhood path tree). Each chip shows its own name regardless of
// type/level: [postalCode] [Hood] [School]. Clicking the chip body recenters the
// map on it; the X removes just that location from the selection. On tight
// widths the chips shrink and their labels truncate with an ellipsis.
export const SelectedLocations = ({
  locations,
  wrap
}: {
  locations: ApiLocation[]
  /** Let the chips run onto further rows (the mobile bar, which grows upward and
   *  aligns them) instead of sharing one line. Stack spaces children with margins,
   *  which a wrapped row applies to the wrong edges — `useFlexGap` switches it to `gap`. */
  wrap?: boolean
}) => {
  const { toggleLocation } = useLocationSelection()
  const { handleClick, loading } = useLocationClick({ locations })
  const { mapRef } = useMapOptions()

  // Chip hover affordance: marker overlays light their marker ring (`.lm.active`),
  // and any overlay whose polygon opts in via `polygon.previewState` previews the selected
  // polygon with the hover outline — keeps the selected fill, no map-hover deselect-red.
  const setChipHover = (location: ApiLocation, hover: boolean) => {
    overlayMarkerActive(location.locationId, hover)
    const overlay = overlayForLocation(overlays.layers, location.type)
    if (overlay?.polygon?.previewState) {
      setPreviewFeatureState(
        mapRef.current,
        overlayPolygonId(overlay.id),
        location.locationId,
        hover
      )
    }
  }

  // Hovering the chip's X shows the polygon's deselect (delete) state — the same red
  // `selected && hover` the map shows when hovering the polygon/marker. Always on.
  const setDeleteHover = (location: ApiLocation, hover: boolean) => {
    const overlay = overlayForLocation(overlays.layers, location.type)
    if (!overlay) return
    setHoverFeatureState(
      mapRef.current,
      overlayPolygonId(overlay.id),
      location.locationId,
      hover
    )
  }

  return (
    <Stack
      spacing={1}
      direction="row"
      alignItems="center"
      useFlexGap={wrap}
      // `wrap-reverse` stacks new rows UPWARD: the bar it wraps in is anchored to
      // the bottom edge, so the first row stays by the map edge and each newly
      // selected location appears above the ones already there.
      flexWrap={wrap ? 'wrap-reverse' : 'nowrap'}
      // wrapped rows line up the way the bar aligns this Stack
      justifyContent={wrap ? 'inherit' : 'flex-start'}
      sx={{
        minWidth: 0,
        flexShrink: 1,
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? 'none' : 'auto'
      }}
    >
      {locations.map((location) => {
        const { locationId, name, type } = location
        return (
          <LocationChip
            key={locationId}
            label={capitalize(name)}
            onClick={() => handleClick(location)}
            onDelete={() => {
              setChipHover(location, false)
              setDeleteHover(location, false)
              toggleLocation(location)
            }}
            onHover={(hover) => setChipHover(location, hover)}
            onDeleteHover={(hover) => setDeleteHover(location, hover)}
            // Resolve the accent the same way the marker/polygon do
            // (`overlayAccent` → the overlay's `color`, else the palette `info`),
            // so a colourless overlay's chip hover matches its blue marker/polygon
            // instead of falling back to the theme primary.
            accentColor={overlayAccent(
              overlayForLocation(overlays.layers, type)
            )}
          />
        )
      })}
    </Stack>
  )
}
