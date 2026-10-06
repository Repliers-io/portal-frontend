import React from 'react'
import { useTranslations } from 'next-intl'

import { Button, Tooltip } from '@mui/material'

import { AiIcon } from '@configs/icons'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialogContext } from 'providers/DialogProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { getCDNPath, getUrlFilename } from 'utils/urls'

import { RoundButton } from '.'

export const AiSubmitButton = ({
  variant = 'icon',
  image
}: {
  variant?: 'icon' | 'outlined'
  image: string
}) => {
  const { hideAllDialogs } = useDialogContext()
  const t = useTranslations('Photos')
  const imageUrl = getCDNPath(getUrlFilename(image), 'small')

  let submit = null
  let setLayout = null
  let searchUrl // undefined

  try {
    // WARN: DO NOT DO THIS UNLESS YOU FULLY UNDERSTAND THE CONSEQUENCES
    // eslint-disable-next-line react-hooks/rules-of-hooks
    submit = useAiSearch().submit
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setLayout = useMapOptions().setLayout
  } catch {
    searchUrl = `/search/grid?aiImage=${encodeURIComponent(imageUrl)}`
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!submit || !setLayout) return

    submit({ images: [imageUrl] })
    hideAllDialogs()

    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <Tooltip
      arrow
      title={t('searchImageNow')}
      placement={variant === 'icon' ? 'right' : 'right'}
    >
      <span>
        {variant === 'icon' ? (
          <RoundButton active={false} href={searchUrl} onClick={handleClick}>
            <AiIcon />
          </RoundButton>
        ) : (
          <Button
            href={searchUrl}
            variant="outlined"
            startIcon={<AiIcon />}
            onClick={handleClick}
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
              }
            }}
          >
            {t('aiSearch')}
          </Button>
        )}
      </span>
    </Tooltip>
  )
}
