import React from 'react'

import { Button, IconButton, Skeleton, Tooltip } from '@mui/material'

import { IosShareOutlinedIcon } from '@configs/icons'

import useClientSide from 'hooks/useClientSide'
import useSnackbar from 'hooks/useSnackbar'

export const ShareButton = ({
  title,
  text = '',
  url = '',
  variant = 'outlined'
}: {
  title: string
  text?: string
  url?: string
  variant?: 'outlined' | 'icon'
}) => {
  const clientSide = useClientSide()
  const { showSnackbar } = useSnackbar()

  if (!url) {
    // eslint-disable-next-line no-param-reassign
    url = typeof window !== 'undefined' ? window.location.href : ''
  }

  const handleClick = (e: any) => {
    if (clientSide) {
      const shareData = { title, text, url }

      let shared
      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          navigator.share(shareData)
          shared = true
        } catch {
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
        } catch {
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
        href={url}
        sx={{ width: 105, flexShrink: 0 }}
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
        <IconButton href={url} color="primary" onClick={handleClick}>
          <IosShareOutlinedIcon
            sx={{ fontSize: 22, mx: '3px', mt: '2px', mb: '4px' }}
          />
        </IconButton>
      </Tooltip>
    ) : null
  }
}
