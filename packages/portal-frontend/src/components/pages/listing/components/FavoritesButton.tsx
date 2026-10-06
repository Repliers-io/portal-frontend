import React, { useEffect, useRef, useState } from 'react'

import { Button, IconButton, Skeleton, Tooltip } from '@mui/material'

import { primary, secondary } from '@configs/colors'
import { HeartEmptyIcon, HeartIcon } from '@configs/icons'

import { FeedbackAnimation } from 'components/atoms'

import { useFavorites } from 'providers/FavoritesProvider'
import { useListing } from 'providers/ListingProvider'
import useClientSide from 'hooks/useClientSide'

export const FavoritesButton = ({
  variant = 'outlined'
}: {
  variant?: 'outlined' | 'icon'
}) => {
  const touched = useRef(false)
  const clientSide = useClientSide()
  const { toggle, find } = useFavorites()
  const [showAnimation, setShowAnimation] = useState(false)

  const { listing } = useListing()
  const added = !!find(listing)

  const Icon = added ? HeartIcon : HeartEmptyIcon
  const iconColor = added ? secondary : primary

  const handleToggle = () => {
    toggle(listing)
    touched.current = true
  }

  useEffect(() => {
    if (added && touched.current) setShowAnimation(true)
  }, [added])

  if (!clientSide) {
    return variant === 'outlined' ? (
      <Skeleton variant="rounded" sx={{ width: 98, height: 48 }} />
    ) : null
  }

  return (
    <>
      {variant === 'outlined' ? (
        <Button
          sx={{ width: 98 }}
          variant="outlined"
          onClick={handleToggle}
          startIcon={<Icon color={iconColor} size={20} />}
        >
          Save
        </Button>
      ) : (
        <Tooltip arrow enterDelay={200} placement="bottom" title="Save">
          <IconButton color="primary" onClick={handleToggle} sx={{ p: 1.5 }}>
            <Icon color={iconColor} size={20} />
          </IconButton>
        </Tooltip>
      )}

      <FeedbackAnimation
        variant="fixed"
        icon={<HeartIcon />}
        iconColor={secondary}
        trigger={showAnimation}
        onComplete={() => setShowAnimation(false)}
      />
    </>
  )
}
