import { useEffect, useState } from 'react'

import { Box, IconButton } from '@mui/material'

import { disabled, secondary } from '@configs/colors'
import { HeartEmptyIcon, HeartIcon } from '@configs/icons'

import { type ApiListing } from 'services/API'
import { useFavorites } from 'providers/FavoritesProvider'
import { useUser } from 'providers/UserProvider'

export const FavoritesButton = ({ listing }: { listing: ApiListing }) => {
  const { logged } = useUser()
  const { find, toggle } = useFavorites()
  const added = !!find(listing)
  const [color, setColor] = useState(added ? secondary : disabled)
  const Icon = added ? HeartIcon : HeartEmptyIcon

  const handleClick = () => {
    // switch button state optimistically depending on the previous state
    // and wait for the real response
    if (logged && !added) setColor(secondary)
    toggle(listing)
  }

  useEffect(() => {
    setColor(added ? secondary : disabled)
  }, [added])

  return (
    <Box sx={{ right: 8, bottom: 8, position: 'absolute' }}>
      <IconButton
        aria-label={added ? 'Remove from favorites' : 'Add to favorites'}
        size="small"
        disableFocusRipple
        sx={{ minWidth: 0 }}
        onClick={handleClick}
      >
        <Icon color={color} />
      </IconButton>
    </Box>
  )
}
