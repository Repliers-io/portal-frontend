import { useTranslations } from 'next-intl'

import { Button } from '@mui/material'

import mapConfig from '@configs/map'
import {
  locationFromProperties,
  useOverlayLocationToggle
} from '@shared/Map/hooks'
import { useLocationClick } from '@shared/Map/SelectedLocations/hooks/useLocationClick'

import {
  useMapLocations,
  useMapPopup,
  useMapPopupActions
} from 'providers/MapOptionsProvider'

/**
 * Selects (or deselects) the tooltip's location — the touch counterpart of a
 * desktop marker click. Touch has no hover, so a tap only previews the marker and
 * the commit moves in here, where it is deliberate and reversible.
 *
 * Renders nothing unless the tooltip was tap-opened AND its overlay actually
 * selects on this map: the same overlay is drawn on the PDP, where no selection
 * is wired behind it. Tooltip cards place it themselves — the shell knows
 * nothing about where a given card wants its action.
 */
export const OverlayLocationButton = () => {
  const t = useTranslations('Map')
  const { overlayPopup } = useMapPopup()
  const { closeOverlayMarkerRef } = useMapPopupActions()
  const { locations } = useMapLocations()
  const toggleOverlayLocation = useOverlayLocationToggle(
    mapConfig.overlays.layers
  )

  const properties = (overlayPopup?.properties ?? {}) as Record<string, unknown>
  const location = locationFromProperties(properties)
  const overlay = mapConfig.overlays.layers.find(
    (o) => o.id === overlayPopup?.overlayId
  )
  // Frames the location exactly as a MapTitle chip click does — the marker's own
  // properties already carry the catchment extent, so this resolves locally and
  // only falls back to the bounds lookup for a point-only location.
  const { handleClick: centerOnLocation } = useLocationClick({
    locations: location ? [location] : []
  })

  if (!overlayPopup?.touch || !overlayPopup.selectable) return null
  if (!location || !overlay) return null

  const selected = (locations ?? []).some(
    (l) => l.locationId === location.locationId
  )

  return (
    <Button
      fullWidth
      size="small"
      color="primary"
      variant={selected ? 'outlined' : 'contained'}
      // Chip height: the tenant sizes a small Button taller (38px), and the
      // button reads as one family with the chips the selection turns into.
      sx={{ py: 0, height: 30 }}
      onClick={async () => {
        // Selecting also frames the location, the way a chip click does; removing
        // it must leave the map where the user left it. The flight lands first:
        // closing the tooltip and the selection re-render the page for a few
        // hundred ms, and a time-based camera animation running alongside would
        // skip straight to its end.
        if (!selected) await centerOnLocation(location)
        // Done — a tooltip left standing covers the map right where the
        // selection changes (and the marker it belongs to).
        closeOverlayMarkerRef.current?.()
        toggleOverlayLocation(overlay, properties)
      }}
    >
      {selected ? t('removeThisLocation') : t('showListingsHere')}
    </Button>
  )
}
