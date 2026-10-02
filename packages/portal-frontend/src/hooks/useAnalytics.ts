/* eslint-disable no-console */
'use client'

import { useCallback } from 'react'

interface EventParams {
  [key: string]: string | number | boolean | undefined
}

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: EventParams
    ) => void
    // dataLayer is already declared in google.d.ts(3, 9)
  }
}

const debugTrackingEvents =
  process.env.NEXT_PUBLIC_DEBUG_TRACKING_EVENTS === 'true'

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, params?: EventParams) => {
    const eventData = { ...params }
    // prioritize dataLayer for Google Tag Manager
    if (
      typeof window.dataLayer !== 'undefined' &&
      typeof window.dataLayer.push === 'function'
    ) {
      window.dataLayer.push({ event: eventName, ...eventData })
      if (debugTrackingEvents)
        console.log(`%c[GTM EVENT]: ${eventName}`, 'color: #7FFFD4', eventData)
    } else if (typeof window.gtag === 'function') {
      // try gtag for Google Analytics
      window.gtag('event', eventName, eventData)
      if (debugTrackingEvents)
        console.log(`%c[GA EVENT]: ${eventName}`, 'color: #7FFFD4', eventData)
    } else {
      if (debugTrackingEvents)
        console.error(
          '%c[ANALYTICS ERROR]: Google Analytics (gtag) or Google Tag Manager (dataLayer) not found.',
          'color: red'
        )
    }
  }, [])

  return trackEvent
}
export default useAnalytics
