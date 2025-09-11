import { useEffect } from 'react'

import { DialogContent, DialogTitle } from '@mui/material'

import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'
import { getCDNPath } from 'utils/urls'

import { BaseFullscreenDialog } from '.'

const dialogName = 'fullscreen-ribbon'

const FullscreenRibbonDialog = () => {
  const { getOptions } = useDialog<GalleryDialogProps>(dialogName)
  const { images = [], active = 0 } = getOptions()
  const { visible } = useDialog(dialogName)

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        document.getElementById(`img-${active}`)?.scrollIntoView()
      }, 100)
    }
  }, [active, visible])

  return (
    <BaseFullscreenDialog name={dialogName}>
      <DialogTitle>{images.length} Images</DialogTitle>
      <DialogContent>
        {images.map((image, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            id={`img-${index}`}
            alt={index.toString()}
            src={getCDNPath(image, 'medium')}
            style={{ width: '100%', marginBottom: 16 }}
          />
        ))}
      </DialogContent>
    </BaseFullscreenDialog>
  )
}

export default FullscreenRibbonDialog
