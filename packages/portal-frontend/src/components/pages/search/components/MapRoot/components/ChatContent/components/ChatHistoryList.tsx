'use client'

import React, { type MouseEvent, useEffect, useRef, useState } from 'react'

import { Box, Stack } from '@mui/material'

import { EmptyChat } from '@shared/EmptyStates'
import { ListingCarousel } from '@shared/Listing'

import { type ApiListing } from 'services/API'
import useClientSide from 'hooks/useClientSide'
import useIntersectionObserver from 'hooks/useIntersectionObserver'

import { maxContainerWidth, maxHistoryHeight } from '../constants'
import { type ChatItem } from '../types'
import { hasFilters } from '../utils'

import {
  ChatActionButtons,
  ChatBubble,
  ChatCarouselTitle,
  ChatDayDivider,
  ChatHistorySkeleton,
  TypingText
} from '.'

// Helper to get day string (YYYY-MM-DD)
const getDayString = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export const ChatHistoryList = React.forwardRef<
  HTMLDivElement,
  {
    history: ChatItem[]
    open?: boolean
    width?: number | string
    maxHeight?: number | string
    loading?: boolean
    onResetFilters?: () => void
    onApplyFilters?: (historyIndex: number) => void
    onOpenCardsGrid?: (historyIndex: number) => void
    onCarouselCardClick?: (
      e: MouseEvent,
      carousel: ApiListing[],
      carouselIndex: number
    ) => void
  }
>(
  (
    {
      history,
      open = false,
      width = maxContainerWidth,
      maxHeight = maxHistoryHeight,
      loading,
      onResetFilters,
      onApplyFilters,
      onOpenCardsGrid,
      onCarouselCardClick
    },
    ref
  ) => {
    const clientSide = useClientSide()
    const [visible, boxRef] = useIntersectionObserver(0)
    const [showButton, setShowButton] = useState<'apply' | 'reset' | false>(
      false
    )
    const lastDayRef = useRef(getDayString(Date.now()))
    React.useImperativeHandle(ref, () => boxRef.current!)

    const carouselsCount = history.reduce((c, i) => (i.carousel ? c + 1 : c), 0)

    const scrollToBottom = (behavior: 'smooth' | 'instant') => {
      boxRef.current?.scrollTo({
        top: 1000000,
        behavior
      })
    }

    const checkFiltersAvailability = () => {
      const lastItem = history.at(-1)
      if (history.length > 1 && !lastItem?.error && hasFilters(lastItem!)) {
        setShowButton(lastItem?.carousel ? 'reset' : 'apply')
      } else {
        setShowButton(false)
      }
    }

    const handleTyping = () => {
      scrollToBottom('smooth')
    }

    const handleTypingEnd = () => {
      checkFiltersAvailability()
      setTimeout(() => scrollToBottom('smooth'), 0)
    }

    const handleApplyFilters = () => {
      setShowButton('reset')
      onApplyFilters?.(history.length - 1)
    }

    const handleResetFilters = () => {
      setShowButton('apply')
      onResetFilters?.()
    }

    useEffect(() => {
      checkFiltersAvailability()
    }, [history.length])

    useEffect(() => {
      // skip one frame to allow the chat history to be rendered
      setTimeout(() => scrollToBottom('smooth'), 100)
    }, [history.length, carouselsCount])

    useEffect(() => {
      if (!open) return
      setTimeout(() => scrollToBottom('instant'), 0)
    }, [open])

    if (!clientSide) {
      return <ChatHistorySkeleton />
    }

    if (!history.length) {
      return (
        <Box
          sx={{
            inset: 0,
            position: 'absolute'
          }}
        >
          <EmptyChat />
        </Box>
      )
    }

    return (
      <Box
        ref={boxRef}
        sx={{
          overflowX: 'none',
          overflowY: 'auto',
          position: 'relative',
          pt: { xs: 7, md: 0 },
          // keep maxHeight inclusive of the padding, or the parent clips the feed's bottom
          boxSizing: 'border-box',
          opacity: open ? 1 : 0,
          scrollbarWidth: 'none',
          bgcolor: 'background.paper',
          transition: 'opacity 0.2s linear',
          maxHeight: !history.length ? 0 : maxHeight,
          width
        }}
      >
        <Stack
          spacing={1}
          sx={{
            '&:first-child': { pt: 1 },
            '&:last-child': { pb: 1 }
          }}
        >
          {history.map((item, historyIndex) => {
            const { value, type, error, timestamp, carousel } = item
            const currentDay = getDayString(timestamp)
            const showDivider = currentDay && lastDayRef.current !== currentDay
            if (showDivider) lastDayRef.current = currentDay

            const carouselTitle = (
              <ChatCarouselTitle
                carousel={carousel}
                onOpenGrid={() => onOpenCardsGrid?.(historyIndex)}
              />
            )

            return (
              <React.Fragment key={historyIndex}>
                {showDivider && <ChatDayDivider date={timestamp!} />}
                <ChatBubble type={type} error={error} timestamp={timestamp}>
                  {type === 'ai' ? (
                    <TypingText
                      text={value}
                      animate={visible}
                      onTyping={handleTyping}
                      onTypingEnd={handleTypingEnd}
                    />
                  ) : (
                    value
                  )}
                </ChatBubble>

                {carousel && (
                  <Box
                    sx={{
                      px: 2,
                      mb: -1,
                      '& .carousel-header': { mb: -1, position: 'relative' },
                      // the counter keeps the first row to itself and the arrows drop
                      // to the second, beside Open grid
                      '& .carousel-header > * + *': {
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        mr: { md: -1 }
                      }
                    }}
                  >
                    {carousel.listings?.length ? (
                      <ListingCarousel
                        size="small"
                        title={carouselTitle}
                        listings={carousel.listings}
                        onCardClick={(e, i) =>
                          onCarouselCardClick?.(e, carousel.listings, i)
                        }
                      />
                    ) : (
                      <Box pb={1}>{carouselTitle}</Box>
                    )}
                  </Box>
                )}
              </React.Fragment>
            )
          })}

          {showButton && (
            <ChatActionButtons
              loading={loading}
              button={showButton}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          )}
        </Stack>
      </Box>
    )
  }
)

ChatHistoryList.displayName = 'ChatHistoryList'
