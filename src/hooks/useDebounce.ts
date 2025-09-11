import { useEffect, useState } from 'react'

const useDebounce = <T>(value: T, delay = 300, deps: any[] = []): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay, ...deps])

  return debouncedValue
}

export default useDebounce
