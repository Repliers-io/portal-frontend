'use client'

import { useEffect, useState } from 'react'
import type React from 'react'

import { centerInRow, updateUrlAnchor } from './utils'

type Options<T extends { id: string }> = {
  sections: readonly T[]
  // the listing browser dialog's scroller; null scrolls the window
  root: HTMLElement | null
  // the sticky bar: its CSS `top` plus its height is the line sections land under
  barRef: React.RefObject<HTMLElement | null>
  // a horizontal row of tabs that keeps the active one in its middle
  rowRef?: React.RefObject<HTMLElement | null>
  // how far under the bar a section lands
  gap: number
  enabled: boolean
  // changes when sections mount or unmount after the first probe (data fetched later)
  revision?: unknown
}

/**
 * The section navigation of a sticky bar: which sections exist, which one is active,
 * whether the bar is pinned, and the smooth scroll that lands a section under it.
 */
export const useSectionNav = <T extends { id: string }>({
  sections,
  root,
  barRef,
  rowRef,
  gap,
  enabled,
  revision
}: Options<T>) => {
  const [present, setPresent] = useState<string[]>([])
  const [pinned, setPinned] = useState(false)
  const [topInset, setTopInset] = useState(0)
  const [bandPercent, setBandPercent] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [clickedId, setClickedId] = useState<string | null>(null)

  // callers rebuild `sections` every render; the joined ids keep the probe from re-running
  const ids = sections.map(({ id }) => id).join()

  useEffect(() => {
    if (enabled)
      setPresent(ids.split(',').filter((id) => document.getElementById(id)))
  }, [ids, enabled, revision])

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const scroller: HTMLElement | Window = root ?? window

    const measure = () => {
      const stickyTop = parseFloat(getComputedStyle(bar).top) || 0
      const rootTop = root ? root.getBoundingClientRect().top : 0
      // sticky can settle a subpixel above its `top`
      setPinned(bar.getBoundingClientRect().top - rootTop <= stickyTop + 1)
      const inset = stickyTop + bar.offsetHeight
      const rootHeight = root ? root.clientHeight : window.innerHeight
      setTopInset(inset)
      // the spy band hugs the landing line: a band reaching down the viewport also takes
      // the section after a short one, which then entered last
      setBandPercent(100 - ((inset + 2 * gap) / rootHeight) * 100)
    }

    measure()
    scroller.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      scroller.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [root, barRef, gap])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }),
      {
        root,
        rootMargin: `${-(topInset + 1)}px 0px -${bandPercent}% 0px`,
        threshold: 0
      }
    )
    present.forEach((id) => {
      const section = document.getElementById(id)
      if (!section) return
      // a native jump to `#id` lands under the bar as well
      section.style.scrollMarginTop = `${topInset + gap}px`
      observer.observe(section)
    })
    return () => observer.disconnect()
  }, [present, root, topInset, bandPercent, gap])

  useEffect(() => {
    if (clickedId === activeId) setClickedId(null)
  }, [activeId, clickedId])

  // the observer keeps the last section it saw, so back above the sections only a pinned bar
  // marks one; a clicked tab stays marked while the smooth scroll passes the sections between
  const active = pinned ? (clickedId ?? activeId) : null

  // the tab row follows the page, except while a clicked tab drives the scroll
  useEffect(() => {
    const row = rowRef?.current
    const tab = row?.querySelector<HTMLElement>('[aria-current]')
    if (!clickedId && row && tab) centerInRow(row, tab)
  }, [active, clickedId, rowRef])

  const scrollToSection = (id: string, sectionGap = gap) => {
    const target = document.getElementById(id)
    if (!target) return
    const rootTop = root
      ? root.getBoundingClientRect().top - root.scrollTop
      : -window.scrollY
    ;(root ?? window).scrollTo({
      top: target.getBoundingClientRect().top - rootTop - topInset - sectionGap,
      behavior: 'smooth'
    })
  }

  const onSelect = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setClickedId(id)
    updateUrlAnchor(id)
    scrollToSection(id)
    ;(root ?? window).addEventListener('scrollend', () => setClickedId(null), {
      once: true
    })
  }

  return {
    available: sections.filter(({ id }) => present.includes(id)),
    active,
    pinned,
    onSelect,
    scrollToSection
  }
}
