import React from 'react'

import { Button, IconButton, Skeleton, Tooltip } from '@mui/material'

import { divider, primary, secondary } from '@configs/colors'
import IcoHeart from '@icons/IcoHeart'
import IcoHeartEmpty from '@icons/IcoHeartEmpty'

import { useFavorites } from 'providers/FavoritesProvider'
import { useProperty } from 'providers/PropertyProvider'
import useClientSide from 'hooks/useClientSide'
import { sold } from 'utils/properties'

const FavoritesButton = ({
  variant = 'outlined'
}: {
  variant?: 'outlined' | 'icon'
}) => {
  const clientSide = useClientSide()
  const { toggle, find } = useFavorites()

  const { property } = useProperty()
  const soldProperty = sold(property)
  const added = !!find(property)
  const disabled = soldProperty && !added

  const Icon = added ? IcoHeart : IcoHeartEmpty
  const iconColor = disabled ? divider : added ? secondary : primary

  if (variant === 'outlined') {
    return clientSide ? (
      <Button
        sx={{ width: 98 }}
        variant="outlined"
        disabled={disabled}
        onClick={() => toggle(property)}
        startIcon={<Icon color={iconColor} size={20} />}
      >
        Save
      </Button>
    ) : (
      <Skeleton variant="rounded" sx={{ width: 98, height: 48 }} />
    )
  } else {
    return clientSide ? (
      <Tooltip arrow enterDelay={200} placement="bottom" title="Save">
        <IconButton
          color="primary"
          onClick={() => toggle(property)}
          sx={{ p: 1.5 }}
        >
          <Icon color={iconColor} size={20} />
        </IconButton>
      </Tooltip>
    ) : null
  }
}

export default FavoritesButton
