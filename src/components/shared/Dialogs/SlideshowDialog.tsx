import { Slideshow } from '@shared/Photos'

import { type GalleryDialogProps, useDialog } from 'providers/DialogProvider'

import { BaseFullscreenDialog } from '.'

const dialogName = 'slideshow'

const SlideshowDialog = () => {
  const { getOptions } = useDialog<GalleryDialogProps>(dialogName)
  const { images = [] } = getOptions()

  return (
    <BaseFullscreenDialog name={dialogName}>
      <Slideshow images={images} />
    </BaseFullscreenDialog>
  )
}

export default SlideshowDialog
