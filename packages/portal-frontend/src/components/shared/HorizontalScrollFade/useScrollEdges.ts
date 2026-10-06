'use client'

import { useEffect, useRef, useState } from 'react'
import type React from 'react'

type Edges = {
  atStart: boolean
  atEnd: boolean
}

// Detects whether a horizontal scroll container is at the start/end of its
// scrollable area by observing 1px sentinel elements placed at both ends.
// Threshold 1.0 fires when a sentinel is fully within the scroll-port.
export const useScrollEdges = (
  scrollContainerRef: React.RefObject<HTMLElement | null>
) => {
  const startSentinelRef = useRef<HTMLDivElement | null>(null)
  const endSentinelRef = useRef<HTMLDivElement | null>(null)
  const [edges, setEdges] = useState<Edges>({ atStart: true, atEnd: true })

  useEffect(() => {
    const root = scrollContainerRef.current
    const start = startSentinelRef.current
    const end = endSentinelRef.current
    if (!root || !start || !end) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const side = entry.target === start ? 'atStart' : 'atEnd'
          setEdges((prev) => ({ ...prev, [side]: entry.isIntersecting }))
        })
      },
      { root, threshold: 1 }
    )
    observer.observe(start)
    observer.observe(end)
    return () => observer.disconnect()
  }, [scrollContainerRef])

  return { startSentinelRef, endSentinelRef, ...edges }
}
