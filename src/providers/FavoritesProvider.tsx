'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { APIFavorites, type Property } from 'services/API'
import { useDialog } from 'providers/DialogProvider'
import { useUser } from 'providers/UserProvider'

type FavoritesContextType = {
  list: Property[]
  loading: boolean
  removing: boolean
  removeId: string | null
  add: (property: Property) => void
  remove: (id: string) => void
  cancelRemove: () => void
  toggle: (property: Property) => void
  find: (property: Property) => string | undefined
}

const FavoritesDataContext = createContext<FavoritesContextType | undefined>(
  undefined
)

const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { showDialog: showLogin } = useDialog('auth')
  const { logged, userRole } = useUser()
  const [list, setList] = useState<Property[]>([])
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
    } finally {
      setLoading(false)
    }
  }

  const find = (property: Property) => {
    const { favoriteId } =
      list.find((x) => x.mlsNumber === property.mlsNumber) || {}
    return favoriteId
  }

  const add = async (property: Property) => {
    const { mlsNumber, boardId } = property
    try {
      setLoading(true)
      const { favoriteId } = await APIFavorites.add(mlsNumber, boardId)
      setList((prev) => [...prev, { ...property, favoriteId }])
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      setRemoving(true)
      await APIFavorites.delete(id)
      setList((prev) => prev.filter((x) => x.favoriteId !== id))
    } finally {
      setRemoving(false)
      setRemoveId(null)
    }
  }

  const cancelRemove = () => {
    setRemoveId(null)
  }

  const toggle = (property: Property) => {
    if (!logged) {
      showLogin()
      return
    }

    const favoriteId = find(property)

    if (!favoriteId) {
      add(property)
    } else {
      setRemoveId(favoriteId)
    }
  }

  useEffect(() => {
    if (!logged) return
    if (!userRole) return
    fetch()
  }, [logged])

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

export const useFavorites = () => {
  const context = useContext(FavoritesDataContext)
  if (!context) {
    throw Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
