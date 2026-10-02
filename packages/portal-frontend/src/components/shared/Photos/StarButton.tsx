import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createPortal } from 'react-dom'

import { Button, Tooltip } from '@mui/material'

import { StarBorderOutlinedIcon, StarOutlinedIcon } from '@configs/icons'

import { FeedbackAnimation } from 'components/atoms'

import { useDialog } from 'providers/DialogProvider'
import { useImageFavorites } from 'providers/ImageFavoritesProvider'
import { useUser } from 'providers/UserProvider'
import useClientSide from 'hooks/useClientSide'
import { getUrlFilename } from 'utils/urls'

import { RoundButton } from '.'

export const StarButton = ({
  image,
  size = 'small',
  variant = 'icon',
  feedbackPortalRef
}: {
  image: string
  size?: 'small' | 'large'
  variant?: 'icon' | 'outlined'
  feedbackPortalRef?: React.RefObject<HTMLDivElement | null>
}) => {
  const { showDialog: showLogin } = useDialog('auth')
  const clientSide = useClientSide()
  const t = useTranslations('Photos')
  const { logged } = useUser()
  const { images, addImage, removeImage } = useImageFavorites()
  const key = getUrlFilename(image)
  const [bookmarked, setBookmarked] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  const Icon = bookmarked ? StarOutlinedIcon : StarBorderOutlinedIcon

  const activeColor = '#FFCB63' // AI yellow "magic" color, TODO: add it to constants or palette
  const normalColor = '#555'

  const toggle = () => {
    if (bookmarked) {
      removeImage(key)
    } else {
      addImage(key)
      setShowAnimation(true)
    }
    setBookmarked(!bookmarked)
  }

  const handleClick = () => (logged ? toggle() : showLogin())

  useEffect(() => {
    setBookmarked(images.includes(key))
  }, [key, images])

  if (!clientSide) return null

  const hasPortal = Boolean(feedbackPortalRef?.current)

  const animation = (
    <FeedbackAnimation
      rotate={true}
      trigger={showAnimation}
      iconColor={activeColor}
      icon={<StarOutlinedIcon />}
      variant={hasPortal ? 'absolute' : 'fixed'}
      onComplete={() => setShowAnimation(false)}
    />
  )

  return (
    <>
      <Tooltip
        arrow
        title={t('starToSave')}
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
              // owns its ground on the dark gallery dialog: a theme may paint
              // outlined buttons (serhant's white pill) in both states
              sx={{
                m: 0.25,
                height: 44,
                color: 'common.white',
                borderColor: 'common.white',
                bgcolor: 'transparent',
                '&:hover': {
                  borderColor: 'common.white',
                  bgcolor: 'rgba(255, 255, 255, 0.08)'
                },
                '& .MuiButton-icon': {
                  color: bookmarked ? activeColor : 'common.white'
                }
              }}
              onClick={handleClick}
            >
              {t('save')}
            </Button>
          )}
        </span>
      </Tooltip>

      {hasPortal
        ? createPortal(animation, feedbackPortalRef!.current!)
        : animation}
    </>
  )
}
