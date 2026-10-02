/**
 * Owns the user's saved searches — create/edit/delete CRUD with alert emails —
 * hydrated from the API for logged-in users.
 * Consumed via useSaveSearch.
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
import type { Position } from 'geojson'
import { useTranslations } from 'next-intl'

import menuConfig from '@configs/menu'

import { APISavedSearch as API } from 'services/API'
import {
  type ApiSavedSearch,
  type ApiSavedSearchUpdateRequest
} from 'services/API'
import { useUser } from 'providers/UserProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useSnackbar from 'hooks/useSnackbar'

import { type CreateSearchParams, type SaveSearchContextType } from './types'
import {
  pickFilters,
  prepareParams,
  resolveLocationBoundaries,
  unionAreas
} from './utils'

const SaveSearchDataContext = createContext<SaveSearchContextType | undefined>(
  undefined
)

const SaveSearchProvider = ({ children }: { children: ReactNode }) => {
  const t = useTranslations('Map')
  const { showSnackbar } = useSnackbar()
  const { desktop } = useBreakpoints()
  const saveSearchInToolbar = menuConfig.toolbar.some(
    (item) => item.item === '$saveSearch'
  )
  const {
    profile: { clientId },
    userRole
  } = useUser()
  const [list, setList] = useState<ApiSavedSearch[]>([])
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetch = async () => {
    try {
      setLoading(true)
      const { searches, numPages } = await API.fetchList()
      setList(searches)
      setPages(numPages)
    } finally {
      setLoading(false)
    }
  }

  const showReplacedSnackbar = (replacedName: string = '') => {
    const message = replacedName
      ? t('saveSearchReplacedNamed', { name: replacedName })
      : t('saveSearchReplaced')
    showSnackbar(message, 'warning', 5000)
  }

  const createSearch = async (params: CreateSearchParams) => {
    if (
      !params.bounds &&
      !params.polygon &&
      !params.region?.length &&
      !params.locations?.length
    ) {
      return
    }
    if (!clientId) return

    try {
      setProcessing(true)
      // Save the union of the fresh selection — the drawn ring + selected
      // locations' boundaries — as one `map`. A loaded saved-search region is a
      // FALLBACK only (re-saving unchanged), never unioned with a new selection.
      const boundaries = params.locations?.length
        ? await resolveLocationBoundaries(params.locations)
        : []
      const selection: (Position[][] | Position[][][])[] = [
        // drawn ring → a single-ring Polygon area
        ...(params.polygon ? [[params.polygon]] : []),
        ...boundaries
      ]
      const region = selection.length
        ? unionAreas(selection)
        : (params.region ?? null)
      const response = await API.create(
        prepareParams({ ...params, region }, clientId)
      )

      if (!response.searchId) return

      const replacedSearch = list.find(
        (item) => item.searchId === response.searchId
      )

      if (replacedSearch) {
        showReplacedSnackbar(
          replacedSearch.name === params.name ? '' : replacedSearch.name
        )

        setList((prev) =>
          prev.map((item) =>
            item.searchId === response.searchId ? response : item
          )
        )
      } else {
        if (!desktop || !saveSearchInToolbar) {
          showSnackbar(t('saveSearchCreated'), 'success')
        }
        setList((prev) => [response, ...prev])
      }
    } catch (error: any) {
      const message = error?.data?.info?.[0]?.msg
      showSnackbar(message || t('saveSearchError'), 'error')
    } finally {
      setProcessing(false)
    }
  }

  const editSearch = async (
    searchId: number,
    params: Partial<ApiSavedSearchUpdateRequest>
  ) => {
    const prevSearch = list.find((item) => item.searchId === searchId)
    if (!prevSearch) return

    try {
      setProcessing(true)
      const prevFilters = pickFilters(prevSearch)
      await API.update({
        ...prevFilters,
        ...params,
        searchId
      } as ApiSavedSearchUpdateRequest) // hackery-fuckery

      setList((prev) =>
        prev.map((item) =>
          item.searchId === searchId ? { ...item, ...params } : item
        )
      )
    } finally {
      setProcessing(false)
      setEditId(null)
    }
  }

  const deleteSearch = async (id: number) => {
    try {
      setProcessing(true)
      await API.delete(id)
      setList((prev) => prev.filter((x) => x.searchId !== id))
    } finally {
      setProcessing(false)
      setDeleteId(null)
    }
  }

  const cancelEdit = () => setEditId(null)
  const cancelDelete = () => setDeleteId(null)

  useEffect(() => {
    if (!clientId) return
    if (!userRole) return
    fetch()
  }, [clientId])

  const contextValue = useMemo(
    () => ({
      list,
      pages,
      loading,
      processing,
      deleteId,
      setDeleteId,
      editId,
      setEditId,
      createSearch,
      editSearch,
      cancelEdit,
      deleteSearch,
      cancelDelete
    }),
    [list, deleteId, editId, loading, processing]
  )

  return (
    <SaveSearchDataContext.Provider value={contextValue}>
      {children}
    </SaveSearchDataContext.Provider>
  )
}

export default SaveSearchProvider

const mockSaveSearch: SaveSearchContextType = {
  list: [],
  loading: false,
  processing: false,
  createSearch: async () => undefined,
  editSearch: () => undefined,
  deleteSearch: () => undefined,
  cancelDelete: () => undefined,
  cancelEdit: () => undefined,
  deleteId: null,
  setDeleteId: () => undefined,
  editId: null,
  setEditId: () => undefined
}

export const useSaveSearch = () =>
  useContext(SaveSearchDataContext) ?? mockSaveSearch
