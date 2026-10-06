import React, { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

import { IconButton, Tooltip } from '@mui/material'

import { ScrollToTopIcon } from '@configs/icons'
import listingsConfig from '@configs/listings'

import { FallInTransition } from 'components/atoms'

import { updateUrlAnchor } from '../utils'

export const ScrollToTopButton = ({ sticky }: { sticky: boolean }) => {
  const containerRef = useRef<HTMLElement | null>(null)
  const t = useTranslations('NavigationBar')

  const handleTopClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    updateUrlAnchor('')
    ;(containerRef.current || window).scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    containerRef.current = document.getElementById(
      listingsConfig.listingBrowserContainerId
    )
  }, [])

  return (
    <FallInTransition show={sticky}>
      <Tooltip
        arrow
        enterDelay={200}
        placement="bottom"
        title={t('backToGallery')}
      >
        <IconButton
          href="#"
          color="primary"
          disableFocusRipple
          onClick={handleTopClick}
        >
          <ScrollToTopIcon
            sx={{ fontSize: 24, m: '2px', transform: 'scaleX(-1)' }}
          />
        </IconButton>
      </Tooltip>
    </FallInTransition>
  )
}
