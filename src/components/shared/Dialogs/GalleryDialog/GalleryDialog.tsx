import { useEffect, useMemo, useRef, useState } from 'react'

import { DialogContent, DialogTitle } from '@mui/material'

import { ContentShadow, LoadingView } from 'components/atoms'

import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'
import { useFeatures } from 'providers/FeaturesProvider'
import { useProperty } from 'providers/PropertyProvider'

import { DialogCloseButton, DialogDrawer } from '../components'

import { GalleryGridView, GalleryGroupsView, GalleryTabs } from './components'
import { getGroupedInsights } from './utils'

export const dialogName = 'gallery'

const GalleryDialog = () => {
  const contentRef = useRef<HTMLDivElement>(null)

  const [scrollY, setScrollY] = useState(0)
  const [tab, setTab] = useState<'grid' | 'groups'>('grid')
  const { visible, hideDialog } = useDialog(dialogName)
  const { getOptions } = useDialog<GalleryDialogProps>(dialogName)
  const { active, images, tab: optionsTab, group } = getOptions()
  const features = useFeatures()

  const {
    property: { imageInsights }
  } = useProperty()

  const groups = useMemo(() => {
    if (!features.aiQuality) return {}
    return getGroupedInsights(imageInsights)
  }, [imageInsights, features.aiQuality])

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
    <DialogDrawer dialogName={dialogName} maxWidth={{ xs: '100%', lg: 1024 }}>
      {features.aiQuality && Object.keys(groups).length > 0 && (
        <GalleryTabs tab={tab} onChange={handleTabChange} />
      )}

      <DialogTitle>{images && `${images.length} Images`}</DialogTitle>
      <DialogCloseButton onClose={hideDialog} />
      <ContentShadow visible={scrollY > 0} />

      <DialogContent
        ref={contentRef}
        onScroll={handleScroll}
        sx={{ overflowX: 'hidden' }}
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

export default GalleryDialog
