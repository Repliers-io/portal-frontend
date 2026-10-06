'use client'

import React, { useMemo } from 'react'

import { FullscreenGalleryDialog } from '@shared/Dialogs'
import { GalleryGridView } from '@shared/Dialogs/GalleryDialog/components'

import { type Post } from 'services/CMS'
import { useDialog } from 'providers/DialogProvider'

type BlogPostGalleryProps = {
  post: Post
}

export const BlogPostGallery = ({ post }: BlogPostGalleryProps) => {
  const { showDialog } = useDialog('fullscreen-gallery')

  const galleryImages = useMemo(() => {
    const gallery = post.acf?.gallery
    if (!Array.isArray(gallery)) return []
    return gallery
      .map((item) => (typeof item === 'string' ? item : item?.url))
      .filter(Boolean) as string[]
  }, [post.acf])

  const handleImageClick = (active?: number) => {
    showDialog({ images: galleryImages, active: active ?? 0 })
  }

  // Don't render if no gallery images
  if (galleryImages.length === 0) return null

  return (
    <>
      <FullscreenGalleryDialog />
      <GalleryGridView images={galleryImages} onImageClick={handleImageClick} />
    </>
  )
}
