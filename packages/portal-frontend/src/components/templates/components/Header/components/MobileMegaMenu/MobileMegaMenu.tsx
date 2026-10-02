'use client'

import { useEffect, useRef, useState } from 'react'

import { Box } from '@mui/material'

import { type DropdownItem } from '../../types'

import { MobileMegaMenuPanel } from './MobileMegaMenuPanel'

interface PanelEntry {
  /** Title shown in the back-button row (name of the parent item) */
  title: string
  items: DropdownItem[]
}

const slideTransition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'

interface MobileMegaMenuProps {
  items: DropdownItem[]
  open: boolean
  onClose: () => void
}

/**
 * Mobile multi-level sliding menu.
 *
 * Navigation:
 * - Tapping an item with children slides the view to the right (new panel)
 * - Tapping the back button slides back to the previous panel
 *
 * Animation:
 * - All panels sit in a `position: relative` container
 * - Each panel is `position: absolute`, translated by `(index - currentIndex) * 100%`
 * - Container height animates to match the height of the currently visible panel
 */
export const MobileMegaMenu = ({
  items,
  open,
  onClose
}: MobileMegaMenuProps) => {
  const [panels, setPanels] = useState<PanelEntry[]>([{ title: '', items }])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [height, setHeight] = useState(0)

  const panelRefs = useRef<(HTMLDivElement | null)[]>([])

  // Measure and apply the height of the currently visible panel
  const syncHeight = (index: number) => {
    requestAnimationFrame(() => {
      const el = panelRefs.current[index]
      if (el) setHeight(el.scrollHeight)
    })
  }

  // Re-measure whenever the active panel changes or panels array changes
  useEffect(() => {
    syncHeight(currentIndex)
  }, [currentIndex, panels.length])

  // Reset to root when items change (e.g., drawer reopens)
  useEffect(() => {
    setPanels([{ title: '', items }])
    setCurrentIndex(0)
  }, [items])

  // Reset to root AFTER the drawer close animation finishes (MUI default: 225ms)
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setPanels([{ title: '', items }])
        setCurrentIndex(0)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleEnter = (item: DropdownItem) => {
    if (!item.children?.length) return

    // Trim any "future" panels (user went back and is now exploring a different branch)
    const newPanels = [
      ...panels.slice(0, currentIndex + 1),
      { title: item.title, items: item.children }
    ]
    const nextIndex = newPanels.length - 1

    // Add the panel first so it renders off-screen at translateX(100%).
    // Then update currentIndex after the browser has painted that initial position,
    // so the CSS transition has a "from" state and the slide animates properly.
    setPanels(newPanels)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurrentIndex(nextIndex)
      })
    })
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height
      }}
    >
      {panels.map((panel, index) => (
        <Box
          key={index}
          ref={(el) => {
            panelRefs.current[index] = el as HTMLDivElement | null
          }}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateX(${(index - currentIndex) * 100}%)`,
            transition: slideTransition
          }}
        >
          <MobileMegaMenuPanel
            title={panel.title}
            items={panel.items}
            showBack={index > 0}
            onBack={handleBack}
            onEnter={handleEnter}
            onClose={onClose}
          />
        </Box>
      ))}
    </Box>
  )
}
