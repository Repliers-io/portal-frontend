'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { APISaveSearch as API } from 'services/API'
import {
  type ApiSavedSearch,
  type ApiSavedSearchUpdateRequest
} from 'services/API'
import { useUser } from 'providers/UserProvider'
import useSnackbar from 'hooks/useSnackbar'

import { type CreateSearchParams, type SaveSearchContextType } from './types'
import { pickFilters, prepareParams } from './utils'

const SaveSearchDataContext = createContext<SaveSearchContextType | undefined>(
  undefined
)

const SaveSearchProvider = ({ children }: { children: ReactNode }) => {
  const { showSnackbar } = useSnackbar()
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

  const showReplacedSnackbar = (replacedName: string = '') =>
    showSnackbar(
      <>
        Previous search{' '}
        {replacedName && (
          <>
            &quot;{replacedName}&quot;
            <br />
          </>
        )}{' '}
        with the same filters was replaced by the new one.
      </>,
      'warning',
      5000
    )

  const createSearch = async (params: CreateSearchParams) => {
    if (!params.bounds && !params.polygon) return
    if (!clientId) return

    try {
      setProcessing(true)
      const response = await API.create(prepareParams(params, clientId))

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
        setList((prev) => [response, ...prev])
      }
    } catch (error: any) {
      if (error.cause && error.cause instanceof Response) {
        const response = await error.cause.json()
        showSnackbar(response.info[0].msg, 'error')
      } else {
        showSnackbar('Unknown error', 'error')
      }
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

export const useSaveSearch = () => {
  const context = useContext(SaveSearchDataContext)
  if (!context) {
    throw Error('useSaveSearch must be used within a SaveSearchProvider')
  }
  return context
}
