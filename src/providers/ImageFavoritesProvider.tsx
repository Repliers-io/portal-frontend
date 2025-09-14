'use client'

import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { APIImageFavorites } from 'services/API'
import { useUser } from 'providers/UserProvider'

type ImageFavoritesContextType = {
  images: string[]
  loading: boolean
  processing: boolean
  removeId: string | null
  addImage: (id: string) => void
  setRemoveId: (id: string) => void
  removeImage: (id: string) => void
  cancelRemove: () => void
}

const ImageFavoritesContext = createContext<
  ImageFavoritesContextType | undefined
>(undefined)

const ImageFavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const { logged, userRole } = useUser()

  const fetch = async () => {
    try {
      setLoading(true)
      const result = await APIImageFavorites.fetch()
      setImages(result.map((image) => image.id))
    } catch (error) {
      console.error('Error fetching images', error)
    } finally {
      setTimeout(() => setLoading(false), 100)
    }
  }

  const addImage = async (id: string) => {
    try {
      setProcessing(true)
      const { result } = await APIImageFavorites.addImage(id)
      if (result) {
        setImages((prevImages) => [...prevImages, id])
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // TODO: handle error
    } finally {
      setProcessing(false)
    }
  }

  const removeImage = async (id: string) => {
    try {
      setProcessing(true)
      const { result } = await APIImageFavorites.deleteImage(id)
      if (result) {
        setImages((prevImages) => prevImages.filter((image) => image !== id))
      }
      setRemoveId(null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // TODO: handle error
    } finally {
      setProcessing(false)
    }
  }

  const cancelRemove = () => setRemoveId(null)

  useEffect(() => {
    if (!logged) return
    if (!userRole) return
    fetch()
  }, [logged])

  const contextValue = useMemo(
    () => ({
      images,
      loading,
      processing,
      addImage,
      removeId,
      setRemoveId,
      removeImage,
      cancelRemove
    }),
    [images, loading, processing, removeId]
  )

  return (
    <ImageFavoritesContext.Provider value={contextValue}>
      {children}
    </ImageFavoritesContext.Provider>
  )
}

export default ImageFavoritesProvider

export const useImageFavorites = () => {
  const context = useContext(ImageFavoritesContext)
  if (!context) {
    throw Error(
      'useImageFavorites must be used within an ImageFavoritesProvider'
    )
  }
  return context
}
