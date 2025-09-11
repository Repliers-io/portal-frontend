export const throttle = (func: (...args: any[]) => void, delay: number) => {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function throttle(this: unknown, ...args: unknown[]) {
    const now = Date.now()

    if (lastCall + delay <= now) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      lastCall = now
      func.apply(this, args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(
        () => {
          lastCall = Date.now()
          timeoutId = null
          func.apply(this, args)
        },
        delay - (now - lastCall)
      )
    }
  }
}
