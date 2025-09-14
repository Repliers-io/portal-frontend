import { useEffect, useRef, useState } from 'react'
import type React from 'react'

const useIntersectionObserver = (
  threshold = 0
): [boolean, React.RefObject<HTMLDivElement | null>] => {
  const [intersecting, setIntersecting] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !rendered) {
          if (count > 1) setRendered(true)
          else setCount((prevCount) => prevCount + 1)
        }
      },
      { threshold }
    )

    const element = ref.current
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rendered, count])

  return [intersecting || rendered, ref]
}

export default useIntersectionObserver
