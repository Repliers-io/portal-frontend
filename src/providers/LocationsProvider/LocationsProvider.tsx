'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  type ApiLocations,
  APISearch,
  type AutosuggestionOption
} from 'services/API'

import revalidate from './revalidate'
import type TrieSearch from './TrieSearch'
import { createTrieSearch } from './utils'

const LocationsDataContext = createContext<any>(null)

type LocationBoardInfo = {
  name: string
  boardId: number
  updatedOn: string
}

export const LocationsProvider = (props: {
  locations: ApiLocations | null
  children: ReactNode
}) => {
  const { children } = props
  const [locations, setLocations] = useState(props.locations)
  const [boards, setBoards] = useState<LocationBoardInfo[]>([])
  const [trie, setTrie] = useState<TrieSearch<AutosuggestionOption> | null>(
    null
  )

  const fetchLocations = async () => {
    const data = await APISearch.fetchLocations()
    if (data) setLocations(data)
  }

  useEffect(() => {
    if (!locations) {
      fetchLocations()
    }

    setInterval(
      async () => {
        await revalidate()
      },
      1e3 * 60 * 60 * 24 // 24h
    )
  }, [])

  useEffect(() => {
    if (locations) {
      setBoards(
        locations.boards.map((board) => {
          const { name, boardId, updatedOn } = board
          return { name, boardId, updatedOn }
        })
      )
      const newTrie = createTrieSearch(locations)
      setTrie(newTrie)
    }
  }, [locations])

  const contextValue = useMemo(
    () => ({ trie, boards, fetchLocations }),
    [trie, boards]
  )

  return (
    <LocationsDataContext.Provider value={contextValue}>
      {children}
    </LocationsDataContext.Provider>
  )
}

type LocationsHookType = () => {
  locationsReady: boolean
  boards: LocationBoardInfo[]
  revalidate: () => Promise<void>
  fetchLocations: () => Promise<void>
  searchLocations: TrieSearch<AutosuggestionOption>['search']
}

export const useLocations: LocationsHookType = () => {
  const context = useContext(LocationsDataContext)
  if (!context) {
    throw Error('useLocations must be used within an LocationsProvider')
  }

  const { trie, boards, fetchLocations } = context
  const locationsReady = !!trie
  // NOTE: not sure if we ever need to expose `revalidate` function
  // NOTE: not sure if we need to expose client-sided `fetchLocations` function as well
  // TODO: discuss any use cases with the team
  // console.log('trie', trie.search('mid'))
  return {
    boards,
    revalidate,
    fetchLocations,
    locationsReady,
    searchLocations: trie?.search.bind(trie) || (() => [])
  }
}
