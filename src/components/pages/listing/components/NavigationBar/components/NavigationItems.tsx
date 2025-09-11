'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Button, Stack } from '@mui/material'

import { navigationItems, propertyDialogContentId } from '../constants'

const getTopOffsetInContainer = (element: Element, container: HTMLElement) => {
  const elementRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return elementRect.top - containerRect.top + container.scrollTop
}

const NavigationItems = ({
  active,
  onChange
}: {
  active: number
  onChange: (index: number) => void
}) => {
  const containerRef = useRef<HTMLElement | null>(null)
  const [available, setAvailable] = useState<boolean[]>([])

  const scrollToElement = useCallback((element: Element) => {
    const container = containerRef.current
    const top = container
      ? getTopOffsetInContainer(element, container) - (52 + 32) // 52px embedded navigation bar height + padding (8*4)
      : element.getBoundingClientRect().top + window.scrollY - (60 + 32) // 60px for the static page navigation bar

    ;(container || window).scrollTo({
      behavior: 'smooth',
      top
    })
  }, [])

  const handleClick = (e: React.MouseEvent, index: number) => {
    const elementId = navigationItems[index].id
    const anchor = document.getElementById(elementId)
    if (anchor) {
      onChange(index)
      scrollToElement(anchor)
      e.preventDefault()
    }
  }

  useEffect(() => {
    // fill the elements array with the flags of availability (existence)
    setAvailable(
      navigationItems.map((item) => !!document.getElementById(item.id))
    )
    // set the scrollable container reference
    containerRef.current = document.getElementById(propertyDialogContentId)
  }, [])

  return (
    <Stack spacing={2} direction="row" justifyContent="center">
      {navigationItems.map((item, index) =>
        available[index] ? (
          <Button
            key={index}
            href={`#${item.id}`}
            variant={active === index ? 'contained' : 'text'}
            onClick={(e: React.MouseEvent) => handleClick(e, index)}
            sx={{ height: '44px', whiteSpace: 'nowrap' }}
          >
            {item.label}
          </Button>
        ) : null
      )}
    </Stack>
  )
}

export default NavigationItems
