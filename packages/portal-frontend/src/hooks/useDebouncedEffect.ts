import { useEffect } from 'react'

const useDebouncedEffect = (
  effect: () => void,
  delay: number,
  deps: any[] = []
) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay)
    return () => clearTimeout(handler)
  }, [delay, ...deps])
}

export default useDebouncedEffect
