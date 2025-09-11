import { useEffect, useState } from 'react'

import { Box, IconButton } from '@mui/material'

import { disabled, secondary } from '@configs/colors'
import IcoHeart from '@icons/IcoHeart'
import IcoHeartEmpty from '@icons/IcoHeartEmpty'

import { type Property } from 'services/API'
import { useFavorites } from 'providers/FavoritesProvider'
import { useUser } from 'providers/UserProvider'
import { sold } from 'utils/properties'

const FavoritesButton = ({ property }: { property: Property }) => {
  const { logged } = useUser()
  const { find, toggle } = useFavorites()
  const added = !!find(property)
  const [color, setColor] = useState(added ? secondary : disabled)
  const Icon = added ? IcoHeart : IcoHeartEmpty

  const handleClick = () => {
    // switch button state optimistically depending on the previous state
    // and wait for the real response
    if (logged && !added) setColor(secondary)
    toggle(property)
  }

  useEffect(() => {
    setColor(added ? secondary : disabled)
  }, [added])

  if (sold(property) && !added) return null

  return (
    <Box sx={{ right: 12, bottom: 12, position: 'absolute' }}>
      <IconButton
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

export default FavoritesButton
