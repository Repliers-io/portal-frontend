import React, { useEffect, useState } from 'react'

import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import StarOutlinedIcon from '@mui/icons-material/StarOutlined'
import { Button, Tooltip } from '@mui/material'

import { useDialog } from 'providers/DialogProvider'
import { useImageFavorites } from 'providers/ImageFavoritesProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'

import { RoundButton } from '.'

const StarButton = ({
  image,
  size = 'small',
  variant = 'icon'
}: {
  image: string
  size?: 'small' | 'large'
  variant?: 'icon' | 'outlined'
}) => {
  const { showDialog: showLogin } = useDialog('auth')
  const clientSide = useClientSide()
  const { logged } = useUser()
  const { images, addImage, removeImage } = useImageFavorites()
  const [bookmarked, setBookmarked] = useState(false)

  const Icon = bookmarked ? StarOutlinedIcon : StarBorderOutlinedIcon

  const activeColor = '#FFCB63' // AI yellow "magic" color, TODO: add it to constants or palette
  const normalColor = '#555'

  const toggle = () => {
    if (bookmarked) {
      removeImage(image)
    } else {
      addImage(image)
    }
    setBookmarked(!bookmarked)
  }

  const handleClick = () => (logged ? toggle() : showLogin())

  useEffect(() => {
    setBookmarked(images.includes(image))
  }, [image])

  if (!clientSide) return null

  return (
    <Tooltip
      arrow
      title="Star to save for later use"
      placement={variant === 'icon' ? 'top-start' : 'left'}
    >
      <span>
        {variant === 'icon' ? (
          <RoundButton
            active={bookmarked}
            activeColor={activeColor}
            normalColor={normalColor}
            onClick={handleClick}
          >
            <Icon fontSize={size} />
          </RoundButton>
        ) : (
          <Button
            variant="outlined"
            startIcon={<Icon fontSize="small" />}
            sx={{
              m: 0.25,
              height: 44,
              color: 'common.white',
              borderColor: 'common.white',
              '& .MuiButton-icon': {
                color: bookmarked ? activeColor : 'common.white'
              }
            }}
            onClick={handleClick}
          >
            Save
          </Button>
        )}
      </span>
    </Tooltip>
  )
}

export default StarButton
