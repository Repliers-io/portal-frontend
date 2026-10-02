import { markerColors } from '@configs/colors'

import { type ApiListing } from 'services/API'

import { factualStatusGroup } from './status'

export type ListingMarkerColor = { color: string; hoverColor?: string }

/**
 * Resolves a listing's marker colour from the tenant's `markerColors` palette,
 * keyed by the listing's factual lifecycle status. A tenant fills only the
 * variants it needs; any variant absent from the palette falls back to
 * `default`. The hover colour falls back to the default's, so all markers share
 * the hover halo unless a variant overrides it.
 *
 * Colour follows `factualStatusGroup` (the scrub-safe `status` A/U), so a
 * price-restricted-for-guest listing keeps its true colour — an active listing
 * stays active, not painted sold. Hiding the price is a separate concern (the
 * marker label), and this matches the status badge, which is also factual.
 */
export const resolveListingMarkerColor = ({
  listing
}: {
  listing: ApiListing
}): ListingMarkerColor => {
  const variant = factualStatusGroup(listing)
  const palette: Record<string, ListingMarkerColor | undefined> = markerColors
  const entry = palette[variant] ?? (markerColors.default as ListingMarkerColor)
  return {
    color: entry.color,
    hoverColor: entry.hoverColor ?? entry.color
  }
}
