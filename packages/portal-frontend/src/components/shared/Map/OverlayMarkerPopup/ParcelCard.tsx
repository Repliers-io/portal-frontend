'use client'

import { Typography } from '@mui/material'

import { useParcelGroups } from '@shared/Map/hooks/useParcelListings'

import { overlayColor } from 'utils/map/overlays'
import { parcelsOverlayId } from 'utils/map/parcelLayers'
import { titleCase } from 'utils/strings'

import { OverlayCard } from './OverlayCard'
import type { TooltipProps } from './tooltipRegistry'

const accentColor = overlayColor(parcelsOverlayId)

// Assessor rows arrive fully capitalised ("120 W 5TH ST"). `titleCase` lowercases
// the whole string before raising each word, which also flattens the two-letter
// directionals Austin uses ("NW" → "Nw") — those go back to caps.
const directional = /^(?:[NSEW]|[NS][EW])$/i

export const streetAddress = (name: unknown) =>
  typeof name === 'string'
    ? titleCase(name)
        .split(' ')
        .map((word) => (directional.test(word) ? word.toUpperCase() : word))
        .join(' ')
    : ''

/**
 * Hover card for a parcel: its address. A parcel holding listings renders nothing —
 * its price marker's hover card is shown instead (see useParcelListings).
 */
export const ParcelCard = ({ properties }: TooltipProps) => {
  const { groups } = useParcelGroups()
  if (groups.some((group) => group.id === properties?.id)) return null

  const address = streetAddress(properties?.name)
  // An empty popup shows nothing, since MapContainer strips the popup chrome globally.
  if (!address) return null

  return (
    <OverlayCard accentColor={accentColor}>
      <Typography variant="body2" fontWeight={700} color="text.primary">
        {address}
      </Typography>
    </OverlayCard>
  )
}
