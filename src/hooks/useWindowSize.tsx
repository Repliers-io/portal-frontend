'use client'

import { useEffect, useState } from 'react'

const useWindowSize = () => {
  const clientSide = typeof window === 'object'

  const [windowSize, setWindowSize] = useState({
    width: clientSide ? window.innerWidth : undefined,
    height: clientSide ? window.innerHeight : undefined,
    isMobile: clientSide && window.innerWidth < 640
  })

  const handleResize = () => {
    setWindowSize({
      width: window.outerWidth,
      height: window.outerHeight,
      isMobile: window.innerWidth < 640
    })
  }

  useEffect(() => {
    if (!clientSide) {
      return
    }

    window.addEventListener('resize', handleResize)

    setWindowSize({
      width: window.outerWidth,
      height: window.outerHeight,
      isMobile: window.innerWidth < 640
    })

    // eslint-disable-next-line consistent-return
    return function cleanup() {
      window.removeEventListener('resize', handleResize)
    }
  }, [clientSide])

  return windowSize
}

export default useWindowSize
