'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

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
}

const AiSearchContext = createContext<AiSearchContextType | undefined>(
  undefined
)

const AiSearchProvider = ({
  children,
  image,
  feature
}: {
  children: React.ReactNode
  image?: string | undefined
  feature?: string | undefined
}) => {
  const { setFilter, removeFilter } = useSearch()
  const [images, setImages] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([])

  const reset = () => {
    setImages([])
    setFeatures([])
    removeFilter('imageSearchItems')
  }

  const submit = ({ images = [], features = [] }: AiSubmitType) => {
    setImages(images)
    setFeatures(features)
    setFilter('imageSearchItems', [
      ...features.map((value) => ({ value, type: 'text', boost: 1 })),
      ...images.map((url) => ({ url, type: 'image', boost: 1 }))
    ])
  }

  useEffect(() => {
    if (image || feature) {
      submit({
        images: image ? [image] : [],
        features: feature ? [feature] : []
      })
    }
  }, [image, feature])

  const contextValue = useMemo(
    () => ({
      images,
      features,
      reset,
      submit
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
