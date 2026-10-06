/**
 * Scoped AI image/feature search. Holds the selected images/features and syncs them into
 * the SearchProvider filters (depends on `useSearch`).
 */
'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

import { useSearch } from 'providers/SearchProvider'

type AiSubmitType = {
  images?: string[]
  features?: string[]
}

type AiSearchContextType = {
  images: string[]
  features: string[]
  reset: () => void
  submit: ({ images, features }: AiSubmitType) => void
  removeItem: (value: string, type: 'image' | 'text') => void
}

const AiSearchContext = createContext<AiSearchContextType | undefined>(
  undefined
)

const AiSearchProvider = ({
  children,
  images: paramImages = [],
  features: paramFeatures = []
}: {
  children: React.ReactNode
  images?: string[]
  features?: string[]
}) => {
  const { setFilter, removeFilter } = useSearch()
  // internal states for images and features
  const [images, setImages] = useState<string[]>(paramImages)
  const [features, setFeatures] = useState<string[]>(paramFeatures)

  const reset = () => {
    setImages([])
    setFeatures([])
    removeFilter('imageSearchItems')
  }

  const submit = ({ images = [], features = [] }: AiSubmitType) => {
    if (!images.length && !features.length) {
      reset()
      return
    }

    setImages(images)
    setFeatures(features)
    setFilter('imageSearchItems', [
      ...images.map((url) => ({ url, type: 'image', boost: 1 })),
      ...features.map((value) => ({ value, type: 'text', boost: 1 }))
    ])
  }

  const removeItem = (value: string, type: 'image' | 'text') => {
    if (type === 'image') {
      const newImages = images.filter((img) => img !== value)
      submit({ images: newImages, features })
    } else {
      const newFeatures = features.filter((feat) => feat !== value)
      submit({ images, features: newFeatures })
    }
  }

  const contextValue = useMemo(
    () => ({
      images,
      features,
      reset,
      submit,
      removeItem
    }),
    [images, features]
  )

  return (
    <AiSearchContext.Provider value={contextValue}>
      {children}
    </AiSearchContext.Provider>
  )
}
export default AiSearchProvider

export const useAiSearch = () => {
  const context = useContext(AiSearchContext)
  if (context === undefined) {
    throw Error('useAiSearch must be used within an AiSearchProvider')
  }
  return context
}
