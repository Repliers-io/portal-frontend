'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Box } from '@mui/material'

import menuConfig from '@configs/menu'

import { type DropdownItem } from '../../types'

import { MegaMenuContent } from './components'

// Animation speed: 2ms per pixel (e.g., 100px height = 200ms duration)
const durationCoefficient = 1
const minDuration = 200
const leaveDelay = 50

export const MegaMenu = ({ items }: { items: DropdownItem[] }) => {
  const [activeItem, setActiveItem] = useState<DropdownItem | null>(null)
  const [height, setHeight] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const [backdropOpacity, setBackdropOpacity] = useState(0)
  const [disableTransition, setDisableTransition] = useState(false)

  const previousHeightRef = useRef(0)
  const waitingForHeightRef = useRef(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const сlickMode = menuConfig.dropdown.trigger === 'click'

  // Dynamic duration based on height difference for consistent animation speed
  const duration = Math.max(
    minDuration,
    Math.abs(height - previousHeightRef.current) * durationCoefficient
  )

  const showContent = (item: DropdownItem) => {
    clearTimeout(cleanupTimeoutRef.current)

    // Store current height BEFORE any state updates
    previousHeightRef.current = height

    setActiveItem(item)
    setBackdropOpacity(1) // Always show backdrop when opening

    // Reopened while the close animation still shows this item: the content is laid
    // out already, so the ResizeObserver stays silent and the height is read here
    const rendered = contentRef.current?.scrollHeight ?? 0
    if (rendered) {
      waitingForHeightRef.current = false
      setHeight(rendered)
      setOpacity(1)
      return
    }

    setOpacity(0)
    // Let ResizeObserver handle height & fade-in after content renders
    waitingForHeightRef.current = true
  }

  const hideContent = () => {
    clearTimeout(timeoutRef.current)
    clearTimeout(cleanupTimeoutRef.current)
    // Content still rendering at this point must not reopen the panel when it lands
    waitingForHeightRef.current = false

    // Calculate close duration BEFORE mutating previousHeightRef,
    // otherwise duration becomes max(minDuration, 0) = minDuration (stale value bug)
    const closeDuration = Math.max(minDuration, height * durationCoefficient)

    // Store current height BEFORE closing
    previousHeightRef.current = height

    setOpacity(0)
    setBackdropOpacity(0)
    setHeight(0)

    // Delay hiding content until animation completes so opacity fades smoothly;
    // a reopen within that window cancels it, otherwise it would blank the reopened panel
    cleanupTimeoutRef.current = setTimeout(() => {
      setActiveItem(null)
      previousHeightRef.current = 0
    }, closeDuration)

    // Notify DropdownMenu items to reset selection
    window.dispatchEvent(new CustomEvent('MegaMenu:closed'))
  }

  const handleMenuItemEnter = (menuItem: DropdownItem) => {
    clearTimeout(timeoutRef.current)
    clearTimeout(cleanupTimeoutRef.current)

    if (activeItem && activeItem !== menuItem) {
      // Switching between menu items: instant hide, then fade-in new content
      previousHeightRef.current = height
      // DON'T set height here - let ResizeObserver handle it after new content renders
      setDisableTransition(true)
      setBackdropOpacity(1) // Ensure backdrop stays visible when switching
      setOpacity(0)

      requestAnimationFrame(() => {
        setActiveItem(menuItem)
        waitingForHeightRef.current = true // Let ResizeObserver handle height & fade-in
        requestAnimationFrame(() => setDisableTransition(false))
      })
    } else {
      showContent(menuItem)
    }
  }

  const handleMenuItemLeave = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(hideContent, leaveDelay)
  }

  const handleContainerEnter = () => {
    if (сlickMode) return // No hover behavior in click mode
    clearTimeout(timeoutRef.current)
    // Notify DropdownMenu items (like handlePaperMouseEnter)
    window.dispatchEvent(new CustomEvent('MegaMenu:mouseenter'))
  }

  const handleContainerLeave = () => {
    if (сlickMode) return // No hover behavior in click mode
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(hideContent, leaveDelay)
    // Notify DropdownMenu items (like handlePaperMouseLeave)
    window.dispatchEvent(new CustomEvent('MegaMenu:mouseleave'))
  }

  const handleBackdropClick = () => {
    if (!сlickMode) return
    hideContent()
  }

  const handleBackdropEnter = () => {
    if (сlickMode) return
    handleContainerEnter()
  }

  const handleBackdropLeave = () => {
    if (сlickMode) return
    handleContainerLeave()
  }

  // ResizeObserver: Wait for actual DOM render before animating height
  // This prevents laggy animations when switching to large content blocks
  useEffect(() => {
    if (!contentRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const newHeight = entries[0].target.scrollHeight

      if (waitingForHeightRef.current && newHeight > 0) {
        // New content rendered: update height and trigger fade-in
        previousHeightRef.current = height
        setHeight(newHeight)
        waitingForHeightRef.current = false
        requestAnimationFrame(() => setOpacity(1))
      } else if (
        !waitingForHeightRef.current &&
        opacity > 0 &&
        height > 0 &&
        newHeight !== height
      ) {
        // Dynamic content change (e.g., images loading): update height only when menu is open
        // and NOT waiting for new content to render
        previousHeightRef.current = height
        setHeight(newHeight)
      }
    })

    resizeObserver.observe(contentRef.current)
    return () => resizeObserver.disconnect()
  }, [opacity, height])

  // Close on Escape key (click mode only)
  useEffect(() => {
    if (!сlickMode || !activeItem) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideContent()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [сlickMode, activeItem])

  // Listen to custom events from DropdownMenu component
  useEffect(() => {
    const handleEvent: EventListener = (e) => {
      const event = e as CustomEvent<{ item: DropdownItem; type: string }>
      if (event.detail.type === 'enter') {
        handleMenuItemEnter(event.detail.item)
      } else if (event.detail.type === 'leave') {
        handleMenuItemLeave()
      }
    }

    window.addEventListener('MegaMenu:trigger', handleEvent)
    return () => window.removeEventListener('MegaMenu:trigger', handleEvent)
  }, [activeItem])

  return (
    <>
      {/* Backdrop - always visible when menu is open */}
      <Box
        className="megamenu-backdrop"
        onClick={handleBackdropClick}
        onMouseEnter={handleBackdropEnter}
        onMouseLeave={handleBackdropLeave}
        sx={{
          inset: 0,
          position: 'fixed',
          zIndex: 1299,
          opacity: backdropOpacity,
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          // Backdrop animates only on open/close
          transition: `opacity ${minDuration}ms ease-out 50ms`,
          // Only clickable in click mode when visible
          pointerEvents: сlickMode && backdropOpacity ? 'auto' : 'none',
          backdropFilter: 'blur(60px)'
        }}
      />

      <Box
        ref={containerRef}
        className="megamenu-panel"
        onMouseEnter={handleContainerEnter}
        onMouseLeave={handleContainerLeave}
        sx={{
          left: 0,
          right: 0,
          top: '100%',
          width: '100%',
          height: `${height}px`,
          zIndex: 'modal',
          overflow: 'hidden',
          position: 'absolute',
          bgcolor: 'background.paper',
          transition: `height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          willChange: 'height' // Hint browser to optimize height animation
        }}
      >
        <Box
          ref={contentRef}
          sx={{
            opacity,
            transition: disableTransition
              ? 'none'
              : `opacity ${duration}ms ease-out`
          }}
        >
          {/* Render all MegaMenuContent items for SEO
          and control visibility with display */}
          {items.map((item, index) => (
            <MegaMenuContent
              key={index}
              item={item}
              onItemClick={hideContent}
              active={activeItem?.title === item.title}
            />
          ))}
        </Box>
      </Box>
    </>
  )
}
