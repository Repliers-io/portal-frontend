import React from 'react'

import { Button, Tooltip } from '@mui/material'

import IcoAi from '@icons/IcoAi'

import { useAiSearch } from 'providers/AiSearchProvider'
import { useDialogContext } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useMapOptions } from 'providers/MapOptionsProvider'
import { getCDNPath } from 'utils/urls'

import { RoundButton } from '.'

const AiSubmitButton = ({
  variant = 'icon',
  image
}: {
  variant?: 'icon' | 'outlined'
  image: string
}) => {
  const features = useFeatures()
  const { hideAllDialogs } = useDialogContext()
  const imageUrl = getCDNPath(image, 'small')

  let submit = null
  let setLayout = null
  let searchUrl // undefined

  try {
    // WARN: DO NOT DO THIS UNLESS YOU FULLY UNDERSTAND THE CONSEQUENCES
    // eslint-disable-next-line react-hooks/rules-of-hooks
    submit = useAiSearch().submit
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setLayout = useMapOptions().setLayout
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    searchUrl = `/search/grid?aiImage=${encodeURIComponent(imageUrl)}`
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!submit || !setLayout) return

    submit({ images: [imageUrl] })
    if (features.aiShowOnGrid) setLayout('grid')
    hideAllDialogs()

    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <Tooltip
      arrow
      title="Search this image right away"
      placement={variant === 'icon' ? 'right' : 'right'}
    >
      <span>
        {variant === 'icon' ? (
          <RoundButton active={false} href={searchUrl} onClick={handleClick}>
            <IcoAi />
          </RoundButton>
        ) : (
          <Button
            href={searchUrl}
            variant="outlined"
            startIcon={<IcoAi />}
            onClick={handleClick}
            sx={{
              m: 0.25,
              height: 44,
              color: 'common.white',
              borderColor: 'common.white'
            }}
          >
            AI Search
          </Button>
        )}
      </span>
    </Tooltip>
  )
}

export default AiSubmitButton
