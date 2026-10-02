import { type UIEvent, useCallback, useEffect, useRef, useState } from 'react'

import { type ApiListing, APIListingDetails } from 'services/API'
import { useDialog } from 'providers/DialogProvider'
import { useSearch } from 'providers/SearchProvider'
import { getSeoTitle, getSeoUrl, resolveBoardId } from 'utils/listings'
import { updateWindowHistory } from 'utils/urls'

import { dialogName } from '../constants'

type UseListingBrowserParams = {
  active: number
  listings: ApiListing[]
}

export const useListingBrowser = ({
  active,
  listings
}: UseListingBrowserParams) => {
  const originalUrl = useRef('')
  const originalTitle = useRef('')
  const [scrollY, setScrollY] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const { visible, hideDialog } = useDialog(dialogName)
  const [activeIndex, setActiveIndex] = useState(active)
  const { cachedListing, saveCachedListing, clearCachedListing } = useSearch()

  // AbortController to cancel outdated property fetch requests
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchFullApiListingDetails = async (listing: ApiListing) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) abortControllerRef.current.abort()

    // Create new controller for this request
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // Read the detail from the board `resolveBoardId` routes this record to —
      // its own board when the tenant addresses that board explicitly
      // (`distinctBoardIds`), the default read board otherwise.
      const response = await APIListingDetails.fetchListing(
        listing.mlsNumber,
        resolveBoardId(listing),
        { signal: controller.signal }
      )
      // Only save if this request wasn't aborted
      if (!controller.signal.aborted) saveCachedListing(response)
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') return

      console.error('Error fetching additional data:', error)
    }
  }

  const updateListingDetails = useCallback(
    (listing: ApiListing) => {
      if (!listing) return
      // update the URL and the title
      updateWindowHistory(getSeoUrl(listing))
      document.title = getSeoTitle(listing)

      saveCachedListing(listing)
      fetchFullApiListingDetails(listing)
    },
    [listings]
  )

  const prev = activeIndex > 0 && listings.length > 0
  const next = activeIndex >= 0 && activeIndex < listings.length - 1
  const { mlsNumber, raw } = cachedListing || {}
  const propertyKey = (mlsNumber || '') + '-' + Object.keys(raw || {}).length

  const handleNavigationClick = (step: number) => {
    const targetListing = listings[activeIndex + step]

    setActiveIndex(activeIndex + step)
    updateListingDetails(targetListing)
    contentRef.current?.scrollTo(0, 0)
  }

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop)
  }

  useEffect(() => {
    if (visible) {
      setScrollY(0)
      originalUrl.current = window.location.href
      originalTitle.current = document.title
    } else {
      if (originalUrl.current) {
        document.title = originalTitle.current
        updateWindowHistory(originalUrl.current)
      }
    }
  }, [visible])

  // properties array/index changed outside of the component, clear the caches
  useEffect(() => {
    setActiveIndex(active)
    const activeListing = listings[active]
    if (activeListing) {
      updateListingDetails(activeListing)
    } else {
      clearCachedListing()
    }
  }, [active, listings])

  return {
    cachedListing,
    activeListing: listings[activeIndex],
    scrollY,
    handleScroll,
    contentRef,
    prev,
    next,
    propertyKey,
    handleNavigationClick,
    hideDialog
  }
}
