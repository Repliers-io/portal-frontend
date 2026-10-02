'use client'

import { useEffect, useState } from 'react'

type Options = {
  items: readonly { id: string }[]
  root?: HTMLElement | null
  // y-coordinate from the scroll-port top below which sections are considered
  // visible — i.e., where the sticky bar visually ends. Pass `stickyTop +
  // barHeight`, not just `stickyTop`, otherwise a section is detected as
  // active while still hidden behind the bar.
  topInset: number
  bandPercent?: number
}

export const useActiveSection = ({
  items,
  root,
  topInset,
  bandPercent = 80
}: Options) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      {
        root: root ?? null,
        rootMargin: `${-(topInset + 1)}px 0px -${bandPercent}% 0px`,
        threshold: 0
      }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items, root, topInset, bandPercent])

  return activeId
}
