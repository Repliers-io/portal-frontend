const preventScroll = (e: Event) => {
  let target = e.target as HTMLElement | null
  while (
    target &&
    target !== document.body &&
    target !== document.documentElement
  ) {
    const style = window.getComputedStyle(target)
    const isScrollableY =
      style.overflowY === 'auto' || style.overflowY === 'scroll'
    const canScrollY = target.scrollHeight > target.clientHeight

    const isScrollableX =
      style.overflowX === 'auto' || style.overflowX === 'scroll'
    const canScrollX = target.scrollWidth > target.clientWidth

    if (e instanceof WheelEvent) {
      const wheelEvent = e as WheelEvent
      // Check Y scroll
      if (isScrollableY && canScrollY) {
        if (
          wheelEvent.deltaY > 0 &&
          target.scrollTop + target.clientHeight < target.scrollHeight
        ) {
          return // Allow scroll down
        }
        if (wheelEvent.deltaY < 0 && target.scrollTop > 0) {
          return // Allow scroll up
        }
      }
      // Check X scroll
      if (isScrollableX && canScrollX) {
        if (
          wheelEvent.deltaX > 0 &&
          target.scrollLeft + target.clientWidth < target.scrollWidth
        ) {
          return // Allow scroll right
        }
        if (wheelEvent.deltaX < 0 && target.scrollLeft > 0) {
          return // Allow scroll left
        }
      }
    } else if (e instanceof TouchEvent) {
      // For touch events, if the element is scrollable in any direction, allow it.
      // This is a simplification; more precise touch handling would involve tracking touch points
      // and deltas, but for many cases, just checking if the container is scrollable is sufficient.
      if ((isScrollableY && canScrollY) || (isScrollableX && canScrollX)) {
        return
      }
    }
    target = target.parentElement
  }
  e.preventDefault()
}
const options = { passive: false }

export const addScrollListeners = () => {
  window.addEventListener('wheel', preventScroll, options)
  window.addEventListener('touchmove', preventScroll, options)
}

export const removeScrollListeners = () => {
  window.removeEventListener('wheel', preventScroll, options as any)
  window.removeEventListener('touchmove', preventScroll, options as any)
}
