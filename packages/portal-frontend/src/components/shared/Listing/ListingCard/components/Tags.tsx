'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Chip } from '@mui/material'

import { useCardSurface } from '@shared/Listing/CardSurface'

import { type ApiListing } from 'services/API'
import { useUser } from 'providers/UserProvider'
import {
  type ListingTag,
  pending,
  resolveBadge,
  resolveBadgeLabel,
  scrubbed,
  sold
} from 'utils/listings'

export const Tags = ({
  listing,
  tags = []
}: {
  listing?: ApiListing
  tags?: ListingTag[]
}) => {
  const surface = useCardSurface()
  const { logged } = useUser()
  const t = useTranslations('Listing.status')

  // On a configured card surface the status badge is driven by badgeSurfaces;
  // without a surface, fall back to the historical unconditional sold/pending
  // pill so cards outside a CardSurface don't lose their badge. Conditional
  // sales (deal accepted, not yet firm) read as "Pending" instead of "Sold".
  let statusLabel: string | null = null
  if (listing) {
    if (surface) {
      const group = resolveBadge(listing, surface, logged)
      statusLabel = group ? resolveBadgeLabel(group, listing, t) : null
    } else if (sold(listing)) {
      // A scrubbed lastStatus hides the true fate — never claim "Sold" for it.
      statusLabel = t(
        pending(listing)
          ? 'pending'
          : scrubbed(listing.lastStatus)
            ? 'offMarket'
            : 'sold'
      )
    }
  }

  const statusTag: ListingTag | null = statusLabel
    ? { label: statusLabel, color: 'secondary' }
    : null

  // Status leads, the AI-quality tag (always last in `tags`) stays last. Status
  // and open house don't co-occur (open house implies an active listing), so this
  // reads as [open house | status, …, quality] across every real case.
  const allTags = statusTag ? [statusTag, ...tags] : tags

  if (!allTags.length) return null

  return allTags.map((tag, index) => {
    const bgcolor = tag.color ? `${tag.color}.main` : 'common.white'
    const color = tag.color ? 'common.white' : 'secondary.main'
    return (
      <Chip
        key={index}
        className="listing-badge"
        data-color={tag.color}
        data-quality={tag.quality}
        label={tag.label.toUpperCase()}
        icon={tag.icon}
        variant="filled"
        sx={{
          '& .MuiChip-label': {
            px: 1
          },
          '& .MuiChip-icon': {
            fontSize: 14,
            ml: 0.75,
            mr: -0.5,
            color: 'inherit'
          },
          p: 0,
          height: 24,
          fontSize: 10,
          fontWeight: 500,
          borderRadius: 1,
          bgcolor,
          color
        }}
      />
    )
  })
}
