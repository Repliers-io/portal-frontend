import type React from 'react'

import listingsConfig from '@configs/listings'
import { NavGalleryButton, ScrollToTopButton } from '@shared/NavigationBar'

import { useBuilding } from 'providers/BuildingProvider'
import { useDialog } from 'providers/DialogProvider'
import useClientSide from 'hooks/useClientSide'

import { resolvers } from '../../../utils'

export const LeftSideButtons = ({ sticky }: { sticky: boolean }) => {
  const clientSide = useClientSide()
  const { showDialog: showGallery } = useDialog('gallery')
  const { gallery } = useBuilding()

  const gridGallery =
    listingsConfig.components.gridGallery &&
    gallery.length >= listingsConfig.gallery.minImagesFor123

  const handleGalleryClick = () => {
    const imageUrls = gallery.map((img) => resolvers.large(img))
    showGallery({ images: imageUrls })
  }

  if (!clientSide) return null

  return (
    <>
      {gridGallery && (
        <NavGalleryButton
          placement="bottom-start"
          onClick={handleGalleryClick}
        />
      )}

      <ScrollToTopButton sticky={sticky} />
    </>
  )
}
