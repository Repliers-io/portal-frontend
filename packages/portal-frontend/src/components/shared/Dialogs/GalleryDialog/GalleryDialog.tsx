'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { DialogContent, DialogTitle } from '@mui/material'

import features from '@configs/features'

import { ContentShadow, contentShadowTop, LoadingView } from 'components/atoms'

import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'

import { DialogCloseButton, DialogDrawer } from '../components'

import { GalleryGridView, GalleryGroupsView, GalleryTabs } from './components'
import { getGroupedInsights } from './utils'

export const dialogName = 'gallery'

export const GalleryDialog = () => {
  const contentRef = useRef<HTMLDivElement>(null)

  const [scrollY, setScrollY] = useState(0)
  const [tab, setTab] = useState<'grid' | 'groups'>('grid')
  const { visible, hideDialog } = useDialog(dialogName)
  const { getOptions } = useDialog<GalleryDialogProps>(dialogName)
  const { active, images, imageInsights, tab: optionsTab, group } = getOptions()

  const groups = useMemo(() => {
    if (!features.aiQuality || !images?.length) return {}
    return getGroupedInsights(imageInsights, images)
  }, [images, imageInsights])

  const { showDialog: showFullscreenGallery } = useDialog('fullscreen-gallery')

  const scrollTo = (index: number, behavior: 'smooth' | 'instant') => {
    if (contentRef.current) {
      const gridItems = contentRef.current.querySelectorAll('.grid-item')

      if (gridItems[index]) {
        gridItems[index].scrollIntoView({ block: 'center', behavior })
      }
    }
  }

  const handleScroll = (e: any) => {
    setScrollY(e.target.scrollTop)
  }

  const handleTabChange = (newTab: 'grid' | 'groups') => {
    const behavior = newTab === tab ? 'smooth' : 'instant'
    setTab(newTab)
    contentRef.current?.scrollTo({ top: 0, behavior })
  }

  const handleImageClick = (active?: number) => {
    if (typeof active !== 'number' || active < 0) return
    showFullscreenGallery({ images, active })
    // switch execution context to provide some time for the new dialog window to show up
    setTimeout(() => scrollTo(active, 'smooth'), 0)
  }

  useEffect(() => {
    if (!visible) {
      setScrollY(0)
    } else {
      if (optionsTab) setTab(optionsTab)

      if (optionsTab === 'groups') {
        setTimeout(() => {
          const groupId = `group-header-${group}`
          const groupElement = document.getElementById(groupId)

          if (groupElement) {
            groupElement.scrollIntoView({
              block: 'start',
              behavior: 'instant'
            })
          }
        }, 0)
      } else {
        // scroll to active image
        setTimeout(() => scrollTo(active, 'instant'), 0)
      }
    }
  }, [active, visible])

  return (
    <DialogDrawer
      dialogName={dialogName}
      maxWidth={{ xs: '100%', lg: 1024 }}
      labelledBy={`${dialogName}-title`}
    >
      {features.aiQuality && Object.keys(groups).length > 0 && (
        <GalleryTabs tab={tab} onChange={handleTabChange} />
      )}

      <DialogTitle
        id={`${dialogName}-title`}
        sx={{
          // Ends where ContentShadow begins. Centred by line-height rather than flex:
          // the theme centres dialog titles with `text-align`, which a flex container
          // would stop applying to the text.
          height: contentShadowTop,
          lineHeight: `${contentShadowTop}px`,
          py: '0 !important'
        }}
      >
        {images && `${images.length} Images`}
      </DialogTitle>
      <DialogCloseButton onClose={hideDialog} />
      <ContentShadow visible={scrollY > 0} />

      <DialogContent
        ref={contentRef}
        onScroll={handleScroll}
        sx={{ overflowX: 'hidden', '&.MuiDialogContent-root': { pb: 4 } }}
      >
        {!images ? (
          <LoadingView />
        ) : tab === 'grid' ? (
          <GalleryGridView images={images} onImageClick={handleImageClick} />
        ) : (
          <GalleryGroupsView groups={groups} onImageClick={handleImageClick} />
        )}
      </DialogContent>
    </DialogDrawer>
  )
}
