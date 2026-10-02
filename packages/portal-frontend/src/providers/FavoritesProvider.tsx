/**
 * Owns the user's saved favorite listings — add/remove/toggle and lookup —
 * hydrated from the API for logged-in users. Depends on UserProvider.
 * Consumed via useFavorites.
 * Anatomy: docs → product-guide/user-features/technical
 */
'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { APIFavorites, type ApiListing } from 'services/API'
import { useDialog } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'
import { resolveBoardId } from 'utils/listings'

type FavoritesContextType = {
  list: ApiListing[]
  loading: boolean
  removing: boolean
  removeId: string | null
  add: (listing: ApiListing) => void
  remove: (id: string) => void
  cancelRemove: () => void
  toggle: (listing: ApiListing) => void
  find: (listing: ApiListing) => string | undefined
}

const FavoritesDataContext = createContext<FavoritesContextType | undefined>(
  undefined
)

const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { showDialog: showLogin } = useDialog('auth')
  const { logged, userRole } = useUser()
  const [list, setList] = useState<ApiListing[]>([])
  const [pages, setPages] = useState(0)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(false)

  const fetch = async () => {
    try {
      setLoading(true)
      const { favorites, numPages } = await APIFavorites.fetch()
      if (Array.isArray(favorites)) {
        setList(favorites)
        setPages(numPages)
      }
    } catch {
      // API unavailable or user not authorized — silently ignore
    } finally {
      setLoading(false)
    }
  }

  const find = (listing: ApiListing) => {
    const { favoriteId } =
      list.find((x) => x.mlsNumber === listing.mlsNumber) || {}
    return favoriteId
  }

  const add = async (listing: ApiListing) => {
    const { mlsNumber } = listing
    try {
      setLoading(true)
      const { favoriteId } = await APIFavorites.add(
        mlsNumber,
        resolveBoardId(listing)
      )
      setList((prev) => [...prev, { ...listing, favoriteId }])
    } catch {
      // API unavailable or user not authorized — silently ignore
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setRemoving(true)
      await APIFavorites.delete(id)
      setList((prev) => prev.filter((x) => x.favoriteId !== id))
    } catch {
      // API unavailable or user not authorized — silently ignore
    } finally {
      setRemoving(false)
      setRemoveId(null)
    }
  }

  const cancelRemove = () => {
    setRemoveId(null)
  }

  const toggle = (listing: ApiListing) => {
    if (!logged) {
      showLogin()
      return
    }

    const favoriteId = find(listing)

    if (!favoriteId) {
      add(listing)
    } else {
      setRemoveId(favoriteId)
    }
  }

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
      list,
      pages,
      loading,
      removing,
      removeId,
      find,
      add,
      toggle,
      remove,
      cancelRemove
    }),
    [list, removeId, loading, removing]
  )

  return (
    <FavoritesDataContext.Provider value={contextValue}>
      {children}
    </FavoritesDataContext.Provider>
  )
}

export default FavoritesProvider

const mockFavorites: FavoritesContextType = {
  list: [],
  loading: false,
  removing: false,
  removeId: null,
  add: () => undefined,
  remove: () => undefined,
  cancelRemove: () => undefined,
  toggle: () => undefined,
  find: () => undefined
}

export const useFavorites = () =>
  useContext(FavoritesDataContext) ?? mockFavorites
