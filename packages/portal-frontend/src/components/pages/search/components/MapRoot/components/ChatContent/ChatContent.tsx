'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Box, Stack } from '@mui/material'

import storageConfigs from '@configs/storage'

import { APIChat, type ApiHttpError, type ApiListing } from 'services/API'
import { useAiSearch } from 'providers/AiSearchProvider'
import { useMapLocations, useMapOptions } from 'providers/MapOptionsProvider'
import { useSearch } from 'providers/SearchProvider'
import useBreakpoints from 'hooks/useBreakpoints'
import useClientSide from 'hooks/useClientSide'

import { DesktopContentShadow } from '../GridContent/components'

import { useApplyFilters } from './hooks/useApplyFilters'
import { ChatHistoryList, ChatInput } from './components'
import { type ChatCarouselData, type ChatItem } from './types'

const { nlpTokenKey, nlpHistoryKey } = storageConfigs

type ChatContentProps = {
  onCarouselCardClick: (
    e: React.MouseEvent,
    carousel: ApiListing[],
    carouselIndex: number
  ) => void
}

export const ChatContent = ({ onCarouselCardClick }: ChatContentProps) => {
  const clientSide = useClientSide()
  const { mobile, tablet } = useBreakpoints()
  const { layout, setLayout } = useMapOptions()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { reset: resetAiFilters } = useAiSearch()
  const { clearLocations } = useMapLocations()
  const { applyFilters, applying } = useApplyFilters()
  const { count, listings, filters, resetFilters, clearPoint, clearGridCache } =
    useSearch()

  const visible = layout === 'chat'

  const initialized = useRef(false)
  const chatStarted = useRef(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const [scrollY, setScrollY] = useState(0)
  const [loading, setLoading] = useState(false)
  const [chatFiltersApplying, setChatFiltersApplying] = useState(false)
  const [history, setHistory] = useState<ChatItem[]>([])
  const [token, setToken] = useState<string | undefined>(undefined)

  // Track which history item is currently applying filters
  const applyingItemIndex = useRef<number | null>(null)
  // Store listings snapshot to detect when new results arrive
  const listingsSnapshot = useRef<typeof listings | null>(null)

  // Monitor listings changes after applying filters
  // This effect handles the async nature of filter application:
  // 1. When filters start applying, save current listings as snapshot
  // 2. Wait until listings array reference changes (new data arrived)
  // 3. Save the carousel data (first 24 results) to the specific history item
  useEffect(() => {
    if (applying) {
      setChatFiltersApplying(true)
      // Capture current listings before new results arrive
      listingsSnapshot.current = listings
    } else if (chatFiltersApplying && listingsSnapshot.current !== listings) {
      // New listings have arrived - save carousel to history
      const data: ChatCarouselData = {
        listings: listings.slice(0, 24),
        filters,
        count
      }

      const index = applyingItemIndex.current
      setHistory((prev) => {
        if (index === null) return prev
        prev[index].carousel = data
        return [...prev]
      })
      setChatFiltersApplying(false)

      // Reset refs for next application
      applyingItemIndex.current = null
      listingsSnapshot.current = null
    }
  }, [applying, listings, chatFiltersApplying])

  const handleScroll = useCallback((e: any) => {
    if (history.length > 0) setScrollY(e.target.scrollTop)
  }, [])

  const handleApplyFilters = async (index: number) => {
    const item = history[index]
    if (item) {
      applyingItemIndex.current = index
      await applyFilters(item)
    }
  }

  const handleResetFilters = () => {
    clearLocations()
    clearPoint()
    resetFilters()
    resetAiFilters()
    applyingItemIndex.current = null
    setHistory((prev) => {
      const lastItem = prev[prev.length - 1]
      if (lastItem?.carousel) {
        return [...prev.slice(0, -1), { ...lastItem, carousel: undefined }]
      }
      return prev
    })
  }

  const handleOpenCardsGrid = async (index: number) => {
    const item = history[index]
    if (item) {
      applyingItemIndex.current = null // Don't save carousel when opening grid
      clearGridCache()
      setLayout('map')
      await applyFilters(item)
    }
  }

  const handleSubmit = async (value: string) => {
    const clientQuery: ChatItem = {
      type: 'client',
      value,
      timestamp: Date.now()
    }
    setHistory((prev) => [...prev, clientQuery])
    chatStarted.current = true

    try {
      setLoading(true)
      const { request, nlpId } = await APIChat.fetchReply({
        value,
        token
      })
      const aiAnswer: ChatItem = {
        type: 'ai',
        value: request.summary,
        timestamp: Date.now(),
        ...request
      }
      setToken(nlpId) // update token
      setHistory((prev) => [...prev, aiAnswer])
    } catch (error: unknown) {
      const apiErrorData = error as ApiHttpError

      const errorMessage =
        apiErrorData?.data?.info?.request?.summary ||
        'Sorry, something went wrong. Please try again.'

      const aiError: ChatItem = {
        type: 'ai',
        error: true,
        value: errorMessage,
        timestamp: Date.now()
      }
      setHistory((prev) => [...prev, aiError])
    } finally {
      setLoading(false)
    }
  }

  const resetChat = () => {
    chatStarted.current = false
    setHistory([])
    setToken(undefined)
    handleResetFilters()
  }

  // mirror history and token to local storage
  useEffect(() => {
    // Don't save to localStorage until we've loaded initial data
    if (!initialized.current) return

    localStorage.setItem(nlpHistoryKey, JSON.stringify(history))

    if (token) localStorage.setItem(nlpTokenKey, token)
    else localStorage.removeItem(nlpTokenKey)
  }, [history, token])

  // Load from localStorage on client side mount
  useEffect(() => {
    if (!clientSide) return

    const storageToken = localStorage.getItem(nlpTokenKey) || undefined
    const storageHistory = JSON.parse(
      localStorage.getItem(nlpHistoryKey) || '[]'
    )
    if (storageHistory.length > 0) setHistory(storageHistory)
    if (storageToken) {
      setToken(storageToken)
      chatStarted.current = true
    }

    initialized.current = true
    scrollRef.current?.addEventListener('scroll', handleScroll)

    return () => {
      scrollRef.current?.removeEventListener('scroll', handleScroll)
    }
  }, [clientSide])

  return (
    <Stack
      direction="column"
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        // GridDesktopContainer has { mt: -1 }, so we need to offset by 8px; below md the
        // chat spans the map's full height in GridMobileDrawer, under the FloatingLayoutSwitch
        top: { xs: 0, md: 8 },
        position: 'absolute',
        zIndex: 'drawer',
        bgcolor: 'background.paper',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      {/* phones and tablets get the shared band from GridMobileDrawer */}
      {!(mobile || tablet) && <DesktopContentShadow visible={scrollY > 0} />}
      <Box sx={{ px: { xs: 0, md: 2 }, flex: 1, overflow: 'hidden' }}>
        <ChatHistoryList
          open={true}
          width="100%"
          maxHeight="100%"
          ref={scrollRef}
          history={history}
          loading={chatFiltersApplying}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          onOpenCardsGrid={handleOpenCardsGrid}
          onCarouselCardClick={onCarouselCardClick}
        />
      </Box>
      <Box
        sx={{
          py: 2,
          px: { xs: 2, md: 4 },
          bgcolor: 'background.default'
        }}
      >
        <ChatInput
          ref={inputRef}
          loading={loading}
          disabled={chatFiltersApplying}
          placeholder={history.length ? 'continue' : 'start'}
          onSubmit={handleSubmit}
          onReset={resetChat}
        />
      </Box>
    </Stack>
  )
}
