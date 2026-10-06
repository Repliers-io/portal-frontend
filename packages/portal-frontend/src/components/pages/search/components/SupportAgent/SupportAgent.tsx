/* eslint-disable no-console */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import queryString from 'query-string'

import { APIChat } from 'services/API'
import { type Filters } from 'services/Search'
import { useDialog } from 'providers/DialogProvider'
import { useSearch } from 'providers/SearchProvider'
import { useUser } from 'providers/UserProvider'
import { detailsAvailable } from 'utils/listings'

import {
  AgentButton,
  AgentChatContainer,
  AgentHeader,
  AgentIframe
} from './components'
import config from './config'
import {
  type AgentMessageData,
  type AgentMessageHandler,
  type AgentMessageHandlers,
  type AgentMessageInput,
  type PostMessageData
} from './types'
import { generateSessionId } from './utils'

interface AgentProps {
  sessionId?: string
  headlessIframeId?: string
  onOpenListing?: (mlsNumber: string, boardId: number) => void
  onCloseListing?: () => void
  onMessageReceived?: (data: PostMessageData) => void
}

export const SupportAgent = ({
  sessionId: propSessionId,
  headlessIframeId = '',
  onOpenListing,
  onCloseListing,
  onMessageReceived
}: AgentProps) => {
  const headlessMode = Boolean(headlessIframeId)
  const { profile } = useUser()
  const [open, setOpen] = useState(false)
  const [agentReady, setAgentReady] = useState(false)
  const { visible } = useDialog('listing')

  const {
    count,
    listings,
    statistics,
    setFilters,
    cachedListing,
    clearCachedListing
  } = useSearch()
  const [nlpToken, setNlpToken] = useState<string | undefined>(undefined)
  const [nlpLoading, setNlpLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const externalIframeRef = useRef<HTMLIFrameElement | null>(null)
  const sessionId = useMemo(
    () => propSessionId || generateSessionId(),
    [propSessionId]
  )

  const { iframeUrl, buttonSx, chatSx } = config

  const sessionIframeUrl = useMemo(() => {
    return queryString.stringifyUrl({
      url: iframeUrl,
      query: { sessionId }
    })
  }, [sessionId])

  const postMessage = useCallback(
    (data: AgentMessageInput) => {
      // Send to external iframe if it exists, otherwise to internal iframe
      const targetIframe = externalIframeRef.current || iframeRef.current

      if (targetIframe?.contentWindow) {
        const messageData = {
          type: data.type,
          payload: {
            ...('payload' in data ? data.payload : {}),
            sessionId
          }
        }
        console.log(
          `%c[${new Date().toISOString()}] SENDING : ${data.type}`,
          'color: teal'
        )
        targetIframe.contentWindow.postMessage(messageData, '*')
      }
    },
    [sessionId]
  )

  const getNlpFilters = useCallback(
    async (query: string): Promise<Filters | null> => {
      setNlpLoading(true)
      try {
        const { request, nlpId } = await APIChat.fetchReply({
          value: query,
          token: nlpToken
        })

        // Update token for next requests
        setNlpToken(nlpId)

        // Extract filters from response
        const filters: Filters = {
          ...request.params,
          ...request.body
        }

        return filters
      } catch (error) {
        console.error('Failed to get NLP filters:', error)
        return null
      } finally {
        setNlpLoading(false)
      }
    },
    [nlpToken]
  )

  // Message handlers mapping - now perfectly type-safe with correct payload types!
  const agentMessageHandlers = useMemo((): AgentMessageHandlers => {
    const handleReady: AgentMessageHandler<'AgentReady'> = () => {
      setAgentReady(true)

      const { userAgent } = navigator
      const userName = profile?.fname || ''

      postMessage({
        type: 'InitSession',
        payload: {
          userAgent,
          userName
        }
      })

      if (listings?.length) {
        postMessage({
          type: 'Listings',
          payload: {
            count,
            listings,
            statistics
          }
        })
      }
    }

    const handleOpenListing: AgentMessageHandler<'OpenListing'> = (data) => {
      // data.payload is now correctly typed as: OpenListingPayload & { sessionId: string }
      const payload = data.payload
      const { mlsNumber, boardId } = payload // All fields are properly typed!
      onOpenListing?.(mlsNumber, boardId)
    }

    const handleCloseListing: AgentMessageHandler<'CloseListing'> = (data) => {
      const payload = data.payload
      if (!payload?.sessionId) return
      clearCachedListing()
      onCloseListing?.()
    }

    const handleRequestListings: AgentMessageHandler<'RequestListings'> = (
      data
    ) => {
      const payload = data.payload
      if (!payload?.sessionId) return

      postMessage({
        type: 'Listings',
        payload: {
          count,
          listings,
          statistics
        }
      })
    }

    const handleExtractFilters: AgentMessageHandler<'ExtractFilters'> = (
      data
    ) => {
      // data.payload is now correctly typed as: ExtractFiltersPayload & { sessionId: string }
      const payload = data.payload
      if (payload?.query) {
        getNlpFilters(payload.query).then((filters) => {
          postMessage({
            type: 'Filters',
            payload: { filters }
          })
        })
      }
    }

    const handleApplyFilters: AgentMessageHandler<'ApplyFilters'> = (data) => {
      const payload = data.payload
      if (payload?.filters) {
        setFilters(payload.filters)
      }
    }

    const handleResetFilters: AgentMessageHandler<'ResetFilters'> = () => {
      setFilters({})
    }

    // Reset cached NLP token when agent is reset
    const handleResetAgent: AgentMessageHandler<'ResetAgent'> = () => {
      setNlpToken(undefined)
    }

    return {
      AgentReady: handleReady,
      OpenListing: handleOpenListing,
      CloseListing: handleCloseListing,
      ResetAgent: handleResetAgent,
      RequestListings: handleRequestListings,
      ExtractFilters: handleExtractFilters,
      ApplyFilters: handleApplyFilters,
      ResetFilters: handleResetFilters
      // Optional handlers omitted - will be handled gracefully
    }
  }, [onOpenListing, onCloseListing])

  const handleMessage = useCallback(
    (event: MessageEvent<AgentMessageData>) => {
      const { data } = event
      if (!data?.type) return

      console.log(
        `%c[${new Date().toISOString()}] RECEIVED: ${data.type}`,
        'color: teal'
      )

      onMessageReceived?.(data)

      const handler = agentMessageHandlers[data.type]
      handler?.(data as never)
    },
    [onMessageReceived, agentMessageHandlers]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Watch for external iframe to appear in DOM (headless mode)
  useEffect(() => {
    if (!headlessMode) return

    const checkExistingIframe = () => {
      const iframe = document.getElementById(
        headlessIframeId
      ) as HTMLIFrameElement | null
      if (iframe && iframe !== externalIframeRef.current) {
        console.log('[SupportAgent] External iframe found:', headlessIframeId)
        externalIframeRef.current = iframe
        return true
      }
      return false
    }

    // Try to find iframe immediately
    if (checkExistingIframe()) return

    // If not found, start observing
    const observer = new MutationObserver((mutations) => {
      if (
        mutations.some((m) => m.type === 'childList' && m.addedNodes.length > 0)
      ) {
        if (checkExistingIframe()) observer.disconnect()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [headlessMode, headlessIframeId])

  useEffect(() => {
    if (agentReady) {
      postMessage({
        type: open ? 'WindowVisible' : 'WindowHidden'
      })
    }
  }, [open, agentReady, postMessage])

  useEffect(() => {
    if (cachedListing && detailsAvailable(cachedListing)) {
      postMessage({
        type: 'ListingDetails',
        payload: { listing: cachedListing }
      })
    }
  }, [cachedListing])

  useEffect(() => {
    postMessage({
      type: 'Listings',
      payload: {
        count,
        listings,
        statistics
      }
    })
  }, [listings])

  useEffect(() => {
    if (!visible) {
      postMessage({
        type: 'CloseListing'
      })
    }
  }, [visible])

  const handleClose = useCallback(() => setOpen(false), [])
  const handleToggle = useCallback(() => setOpen(!open), [open])

  // Headless mode: Don't render UI, only handle messages from externalIframeId
  if (headlessMode) {
    return null
  }

  // Normal mode: Render full chat UI
  return (
    <>
      <AgentButton open={open} sx={buttonSx} onClick={handleToggle} />

      <AgentChatContainer open={open} sx={chatSx}>
        <AgentHeader onClose={handleClose} loading={nlpLoading} />
        <AgentIframe ref={iframeRef} src={sessionIframeUrl} />
      </AgentChatContainer>
    </>
  )
}
