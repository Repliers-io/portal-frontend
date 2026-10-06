'use client'

import { IconButton } from '@mui/material'

import { OpenInNewIcon } from '@configs/icons'

import { useListing } from 'providers/ListingProvider'
import { getSeoUrl } from 'utils/listings'

export const StaticPageButton = () => {
  const { listing } = useListing()
  const href = getSeoUrl(listing)

  return (
    <IconButton
      href={href}
      size="large"
      target="_blank"
      sx={{
        top: 8,
        right: 56,
        position: 'absolute',
        color: 'common.black'
      }}
    >
      <OpenInNewIcon sx={{ width: 20, height: 20, p: '2px' }} />
    </IconButton>
  )
}
