import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Box, Skeleton } from '@mui/material'

import { nlpHistoryKey, nlpTokenKey } from '@configs/storage'

import { APIChat } from 'services/API'
import { useSearch } from 'providers/SearchProvider'
import useClientSide from 'hooks/useClientSide'

import { ChatHistoryList, ChatInput } from './components'
import {
  activeBgColor,
  maxContainerWidth,
  maxHistoryHeight,
  minContainerContinueWidth,
  minContainerStartWidth
} from './constants'
import { type ChatItem } from './types'

const AiChat = () => {
  const clientSide = useClientSide()
  const { setFilters, resetFilters } = useSearch()

  const [storageToken, storageHistory] = useMemo(
    () =>
      clientSide
        ? [
            localStorage.getItem(nlpTokenKey) || undefined,
            JSON.parse(localStorage.getItem(nlpHistoryKey) || '[]')
          ]
        : [undefined, []],
    [clientSide]
  )

  const chatStarted = useRef(!!storageToken)
  const [history, setHistory] = useState<ChatItem[]>(storageHistory)
  const [token, setToken] = useState<string | undefined>(storageToken)

  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)

  const containerWidth =
    focused || open
      ? maxContainerWidth
      : !chatStarted.current
        ? minContainerStartWidth
        : minContainerContinueWidth

  const handleSubmit = async (value: string) => {
    const clientQuery: ChatItem = { type: 'client', value }
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
        ...request
      }
      setToken(nlpId) // update token
      setHistory((prev) => [...prev, aiAnswer])

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // TODO: handle error
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (item: ChatItem) => {
    const { params, body } = item
    // eslint-disable-next-line no-console
    console.log('Apply Filters', params)
    // eslint-disable-next-line no-console
    console.log('BODY', body)
    setFilters({
      ...params,
      ...body
    })
  }

  const resetHistory = () => {
    setHistory([])
    setToken(undefined)
  }

  const resetChat = () => {
    // give it some time to close the window
    setTimeout(resetHistory, open ? 400 : 0)

    resetFilters()
    setOpen(false)
    setFocused(false)
    chatStarted.current = false
  }

  // mirror history and token to local storage
  useEffect(() => {
    localStorage.setItem(nlpHistoryKey, JSON.stringify(history))

    if (token) localStorage.setItem(nlpTokenKey, token)
    else localStorage.removeItem(nlpTokenKey)
  }, [history, token])

  useEffect(() => {
    if (focused && chatStarted.current) {
      setOpen(true)
    }
    if (!focused && !hovered) {
      setOpen(false)
    }
  }, [chatStarted.current, hovered, focused])

  if (!clientSide) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: { xs: 54, sm: 164 },
          height: { xs: 38, sm: 48 }
        }}
      />
    )
  }

  return (
    <Box
      sx={{
        height: 48,
        minWidth: 164,
        overflow: 'visible',
        position: 'relative'
      }}
    >
      <Box
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        sx={{
          zIndex: 'modal',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'absolute',
          bgcolor: 'background.paper',
          p: focused || open ? 0 : '1px',
          border: focused || open ? 2 : 1,
          boxShadow: focused || open ? 1 : 0,
          '&:hover': { borderColor: 'secondary.main', bgcolor: activeBgColor },
          transition: 'border-color 0.15s linear, max-width 0.3s ease',
          borderColor: focused || open ? 'secondary.main' : 'secondary.light',
          maxWidth: containerWidth
        }}
      >
        <Box
          sx={{
            overflow: 'hidden',
            willTransform: 'max-width, width, max-height',
            maxHeight: open ? maxHistoryHeight : 0,
            transition: 'max-height 0.3s ease'
          }}
        >
          <ChatHistoryList
            open={open}
            history={history}
            onResetFilters={resetFilters}
            onApplyFilters={applyFilters}
          />
        </Box>
        <Box sx={{ mx: '-2px' }}>
          <ChatInput
            open={open}
            loading={loading}
            placeholder={chatStarted.current ? 'continue' : 'start'}
            onBlur={() => setFocused(false)}
            onFocus={() => setFocused(true)}
            onSubmit={handleSubmit}
            onReset={resetChat}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default AiChat
