import React from 'react'

import { ShareButton } from '@shared/Buttons'

import { useListing } from 'providers/ListingProvider'
import { getSeoTitle, getSeoUrl, sanitizeScrubbed } from 'utils/listings'

export const ListingShareButton = ({
  variant = 'outlined'
}: {
  variant?: 'outlined' | 'icon'
}) => {
  const { listing } = useListing()
  const title = getSeoTitle(listing)
  // mobile browsers will limit the text length to 300-500 characters
  const text = sanitizeScrubbed(listing.details.description)
  const host = typeof window !== 'undefined' ? window.location.host : ''
  const url = `https://${host}${getSeoUrl(listing)}`

  return <ShareButton title={title} text={text} url={url} variant={variant} />
}
