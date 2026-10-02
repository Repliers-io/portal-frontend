import { useState } from 'react'

import storageConfigs from '@configs/storage'

import { type ApiListing } from 'services/API'

const MAX_RECENTS = 30

const useRecents = () => {
  const [recents, setRecents] = useState<ApiListing[]>(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(storageConfigs.recentsKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })

  const addRecent = (listing: ApiListing) => {
    if (!listing.mlsNumber || !listing.boardId) return

    setRecents((prev) => {
      const filtered = prev.filter(
        (p) =>
          `${p.mlsNumber}-${p.boardId}` !==
          `${listing.mlsNumber}-${listing.boardId}`
      )

      const recents = [listing, ...filtered].slice(0, MAX_RECENTS)

      localStorage.setItem(storageConfigs.recentsKey, JSON.stringify(recents))
      // Add to beginning and limit to MAX_RECENTS
      return recents
    })
  }

  const clearRecents = () => {
    localStorage.removeItem(storageConfigs.recentsKey)
    setRecents([])
  }

  return {
    recents,
    addRecent,
    clearRecents
  }
}

export default useRecents
