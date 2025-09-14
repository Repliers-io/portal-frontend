/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined'
import { Button, IconButton, Skeleton, Tooltip } from '@mui/material'

import { useProperty } from 'providers/PropertyProvider'
import useClientSide from 'hooks/useClientSide'
import useSnackbar from 'hooks/useSnackbar'
import { getSeoTitle, getSeoUrl } from 'utils/properties'

const ShareButton = ({
  variant = 'outlined'
}: {
  variant?: 'outlined' | 'icon'
}) => {
  const clientSide = useClientSide()
  const { showSnackbar } = useSnackbar()

  const { property } = useProperty()
  const propertyUrl = getSeoUrl(property)

  const handleClick = (e: any) => {
    if (clientSide) {
      // getSeoUrl() returns a relative URL, so we need to prepend the current host
      // WARN: Share API is available only in secure contexts (HTTPS).
      const shareData = {
        title: getSeoTitle(property),
        text: property.details.description, // mobile browsers will limit the text length to 300-500 characters
        url: `https://${window.location.host}${propertyUrl}`
      }

      let shared
      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          navigator.share(shareData)
          shared = true
        } catch (e) {
          shared = false
        }
      }

      let copied
      // Share API failed or not available, fallback to clipboard
      if (!shared) {
        try {
          navigator.clipboard.writeText(shareData.url)
          showSnackbar('Link copied to clipboard', 'success')
          copied = true
        } catch (e) {
          copied = false
        }
      }

      if (shared || copied) {
        e.preventDefault()
        e.stopPropagation()
      } else {
        // just navigate to the property page thru the link
      }
    }
  }

  if (variant === 'outlined') {
    return clientSide ? (
      <Button
        href={propertyUrl}
        sx={{ width: 105 }}
        variant="outlined"
        onClick={handleClick}
        startIcon={<IosShareOutlinedIcon />}
      >
        Share
      </Button>
    ) : (
      <Skeleton variant="rounded" sx={{ width: 105, height: 48 }} />
    )
  } else {
    return clientSide ? (
      <Tooltip arrow enterDelay={200} placement="bottom" title="Share">
        <IconButton href={propertyUrl} color="primary" onClick={handleClick}>
          <IosShareOutlinedIcon
            sx={{ fontSize: 22, mx: '3px', mt: '2px', mb: '4px' }}
          />
        </IconButton>
      </Tooltip>
    ) : null
  }
}

export default ShareButton
