import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import searchConfig from '@configs/search'

import { useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import { toServerPage, updatePageParam } from 'utils/pagination'
import { updateWindowHistory } from 'utils/urls'

export const useGridPagination = () => {
  const params = useSearchParams()
  const { count, filters, multiUnits } = useSearch()
  const { position } = useMapOptions()

  const paramsPage = Number(params.get('page') || 1)
  const pagesCount = Math.ceil(count / searchConfig.pageSize)

  const [clientPage, setClientPage] = useState(paramsPage)
  const serverPage = toServerPage(clientPage)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const currentServerPage = useRef<number>(1)
  const mapInitialized = useRef(false)

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }

  const { center, zoom } = position
  const muLength = multiUnits.length
  const prevParams = useRef(JSON.stringify({ center, zoom, filters, muLength }))
  const curParams = JSON.stringify({ center, zoom, filters, muLength })
  const shouldResetPage = curParams !== prevParams.current

  // WARN: every `center`|`zoom`|`filters` change should update the URL and reset the page to 1
  useEffect(() => {
    if (!center || !zoom) return
    if (!shouldResetPage) return
    prevParams.current = curParams
    // Skip page reset on first map initialization (center/zoom going from null → real values).
    // Only reset when the user actively moves the map or changes filters.
    if (!mapInitialized.current) {
      mapInitialized.current = true
      return
    }
    setClientPage(1)
  }, [shouldResetPage])

  const handlePageUpdate = (newPage: number) => {
    setClientPage(newPage)
    // WARN: we can't rely on the router as it rerenders the page
    // when layout 'grid'|'map' changes, because it is a slug of the page route
    updateWindowHistory(updatePageParam(newPage))
  }

  return {
    paramsPage,
    clientPage,
    serverPage,
    pagesCount,
    scrollRef,
    scrollToTop,
    currentServerPage,
    handlePageUpdate
  }
}
