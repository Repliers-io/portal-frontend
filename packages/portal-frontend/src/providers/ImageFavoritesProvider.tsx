/**
 * Owns the user's saved listing photos — add/remove image favorites by id —
 * hydrated from the API for logged-in users.
 * Consumed via useImageFavorites.
 * Anatomy: docs → product-guide/user-features/technical
 */
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
import { logError } from 'utils/log'

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
      logError('Error fetching images', error)
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
    } catch {
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
    } catch {
      // TODO: handle error
    } finally {
      setProcessing(false)
    }
  }

  const cancelRemove = () => setRemoveId(null)

  // `userRole` comes from the profile, which UserProvider reads from localStorage
  // after mount — it is still empty when `logged` alone first turns true, so the
  // role has to re-trigger this effect or the list is never fetched
  useEffect(() => {
    if (!logged) return
    if (!userRole) return
    fetch()
  }, [logged, userRole])

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

const mockImageFavorites: ImageFavoritesContextType = {
  images: [],
  loading: false,
  processing: false,
  removeId: null,
  addImage: () => undefined,
  setRemoveId: () => undefined,
  removeImage: () => undefined,
  cancelRemove: () => undefined
}

export const useImageFavorites = () =>
  useContext(ImageFavoritesContext) ?? mockImageFavorites
