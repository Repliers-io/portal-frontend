import { useEffect, useState } from 'react'

import {
  Box,
  CircularProgress,
  DialogContent,
  DialogTitle
} from '@mui/material'

import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'

import { BaseFullscreenDialog } from '.'

const dialogName = 'fullscreen-ribbon'

const RibbonImage = ({ src, index }: { src: string; index: number }) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <Box id={`img-${index}`} sx={{ position: 'relative', mb: 2 }}>
      {!loaded && (
        <Box
          sx={{ aspectRatio: '3 / 2', display: 'grid', placeItems: 'center' }}
        >
          <CircularProgress sx={{ color: 'common.white' }} />
        </Box>
      )}
      <Box
        component="img"
        src={src}
        alt={String(index)}
        onLoad={() => setLoaded(true)}
        sx={{ width: '100%', display: loaded ? 'block' : 'none' }}
      />
    </Box>
  )
}

export const FullscreenRibbonDialog = () => {
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
        {images.map((src, index) => (
          <RibbonImage key={index} src={src} index={index} />
        ))}
      </DialogContent>
    </BaseFullscreenDialog>
  )
}
