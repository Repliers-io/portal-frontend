'use client'

import { useEffect, useRef } from 'react'
import type React from 'react'

type WheelTarget =
  | HTMLElement
  | null
  | undefined
  | React.RefObject<HTMLElement | null>

type WheelNavigationOptions = {
  active: boolean
  onPrev: () => void
  onNext: () => void
}

// horizontal travel that advances one step
const stepThreshold = 40
// silence that ends a trackpad gesture, so its inertia tail cannot leak into the next one
const gestureGap = 120
// Firefox reports wheel deltas in lines instead of pixels
const lineHeight = 16

export const useWheelNavigation = (
  target: WheelTarget,
  { active, onPrev, onNext }: WheelNavigationOptions
) => {
  // the latest callbacks: a caller re-rendering mid-gesture must not re-attach the
  // listener, which would reset the gesture and let its inertia tail step again
  const step = useRef({ onPrev, onNext })
  step.current = { onPrev, onNext }

  useEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element || !active) return

    let travel = 0
    let lastEvent = 0

    const handleWheel = (e: WheelEvent) => {
      // a nested carousel already claimed this gesture
      if (e.defaultPrevented) return
      // vertical intent belongs to the page
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      // browsers turn a horizontal trackpad swipe into history navigation
      e.preventDefault()

      const delta =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? e.deltaX * lineHeight
          : e.deltaX

      if (
        e.timeStamp - lastEvent > gestureGap ||
        Math.sign(delta) !== Math.sign(travel)
      ) {
        travel = 0
      }
      lastEvent = e.timeStamp
      travel += delta

      if (Math.abs(travel) < stepThreshold) return
      travel = 0

      if (delta > 0) step.current.onNext()
      else step.current.onPrev()
    }

    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => element.removeEventListener('wheel', handleWheel)
  }, [target, active])
}
