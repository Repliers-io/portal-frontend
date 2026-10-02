import { useEffect, useRef, useState } from 'react'

/**
 * Hook to track loading state of multiple grids for navigation bar visibility
 * Listens to BuildingListings:loading and BuildingSoldListings:loading events
 * Returns true when all grids have finished loading or after 10 second timeout
 */
export const useNavigationBarLoading = () => {
  const [loaded, setLoaded] = useState(false)
  const loadingCountRef = useRef(2) // BuildingListings + BuildingSoldListings

  useEffect(() => {
    // Fallback timer: mark as loaded after 10 seconds regardless
    const fallbackTimer = setTimeout(() => {
      setLoaded(true)
    }, 10000)

    const handleLoadingChange = (e: Event) => {
      const event = e as CustomEvent<{ loading: boolean }>
      if (!event.detail.loading) {
        loadingCountRef.current -= 1
        if (loadingCountRef.current <= 0) setLoaded(true)
      }
    }

    window.addEventListener('BuildingListings:loading', handleLoadingChange)
    window.addEventListener('BuildingSoldListings:loading', handleLoadingChange)

    return () => {
      clearTimeout(fallbackTimer)
      window.removeEventListener(
        'BuildingListings:loading',
        handleLoadingChange
      )
      window.removeEventListener(
        'BuildingSoldListings:loading',
        handleLoadingChange
      )
    }
  }, [])

  return loaded
}
