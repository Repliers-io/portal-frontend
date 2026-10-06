'use client'

import { useEffect, useRef, useState } from 'react'
import type React from 'react'

type DragNavigationOptions = {
  active: boolean
  onPrev: () => void
  onNext: () => void
}

// travel that turns a press into a drag, so a jittery click still clicks
const dragSlop = 5
// horizontal pull that advances one step
const stepThreshold = 60
// how long `dragged` outlives the drag
const dragCooldown = 1000

// Mouse drag over a photo: the photo layer follows the pointer, and a long enough
// pull throws it out of the frame and steps to the neighbour. Spread `handlers` on
// the dragged area and `layer` on the photo layer, and call `settle` once the next
// photo is on screen.
export const useDragNavigation = ({
  active,
  onPrev,
  onNext
}: DragNavigationOptions) => {
  const origin = useRef<number | null>(null)
  // the press has moved past `dragSlop`
  const moved = useRef(false)
  const [offset, setOffset] = useState(0)
  // the side the thrown photo leaves through: -1 left, 1 right, 0 none
  const [exit, setExit] = useState(0)
  // after the throw the layer stays hidden until `settle` reports the next photo
  // shown, so the outgoing photo never springs back to the centre
  const [stepped, setStepped] = useState(false)

  const release = () => {
    origin.current = null
    setOffset(0)
  }

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      moved.current = false
      if (!active || e.pointerType !== 'mouse' || e.button !== 0) return
      origin.current = e.clientX
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (origin.current === null) return
      const travel = e.clientX - origin.current
      if (!moved.current && Math.abs(travel) < dragSlop) return
      // captured only once it is a drag, so a plain click still lands on the control under it
      if (!moved.current) e.currentTarget.setPointerCapture(e.pointerId)
      moved.current = true
      setOffset(travel)
    },
    onPointerUp: () => {
      if (Math.abs(offset) < stepThreshold) return release()
      origin.current = null
      setExit(Math.sign(offset))
    },
    onPointerCancel: release,
    // the click that ends a drag must not open the photo or press a control
    onClickCapture: (e: React.MouseEvent) => {
      if (moved.current) e.stopPropagation()
    },
    // the browser's own image drag would take the pointer away
    onDragStart: (e: React.DragEvent) => e.preventDefault()
  }

  const style: React.CSSProperties = {
    transform: exit ? `translateX(${exit * 100}%)` : `translateX(${offset}px)`,
    transition: exit ? 'transform 0.1s ease-in' : undefined,
    visibility: stepped ? 'hidden' : undefined
  }

  // true while dragging and for `dragCooldown` after, so overlays stay quiet
  // between drags in a row
  const dragging = offset !== 0
  const [dragged, setDragged] = useState(false)
  if (dragging && !dragged) setDragged(true)

  useEffect(() => {
    if (dragging || !dragged) return
    const timer = setTimeout(() => setDragged(false), dragCooldown)
    return () => clearTimeout(timer)
  }, [dragging, dragged])

  const layer = {
    style,
    onTransitionEnd: (e: React.TransitionEvent) => {
      // the photos' own fades bubble up here too
      if (e.target !== e.currentTarget) return
      if (exit < 0) onNext()
      else onPrev()
      setExit(0)
      setOffset(0)
      setStepped(true)
    }
  }

  return {
    dragged,
    stepped,
    settle: () => setStepped(false),
    handlers,
    layer
  }
}
