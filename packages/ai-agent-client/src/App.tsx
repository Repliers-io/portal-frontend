import { useState, useEffect, useRef } from 'react'
import queryString from 'query-string'
import '@fontsource/poppins'
import './styles/index.css'
import { AgentMessages, QuestionChips } from './components'
import { initialQuestions, type QuestionOption } from './config/questions'
import { PING_INTERVALS, agentNames, avatars } from './config/agents'
import { generateSessionId, getRandomExcluding, getRandomItem } from './utils'

export function App() {
  const readyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [handshakeComplete, setHandshakeComplete] = useState(false)

  const [agentAvatar, setAgentAvatar] = useState(() => getRandomItem(avatars))
  const [agentName, setAgentName] = useState(() => getRandomItem(agentNames))
  const [agentMessages, setAgentMessages] = useState<string[]>([])
  const [questionOptions, setQuestionOptions] = useState<QuestionOption[]>([])
  const [userName, setUserName] = useState<string>('there')

  // real-estate specific context
  const [listings, setListings] = useState<any[]>([])
  const [listingDetails, setListingDetails] = useState<any>(null)

  const [sessionId] = useState<string>(() => {
    const params = queryString.parse(window.location.search)
    const urlSessionId = params.sessionId as string
    return urlSessionId || generateSessionId()
  })

  const addAgentMessage = (message: string) => {
    setAgentMessages((prev) => [...prev, message])
  }

  const resetAgent = () => {
    postMessage({ type: 'AgentReset' })
    postMessage({ type: 'ResetFilters' })
  }

  const changeAgent = () => {
    resetAgent()
    // Generate new agent (different from current)
    const newAvatar = getRandomExcluding(avatars, agentAvatar)
    const newName = getRandomExcluding(agentNames, agentName)

    setAgentAvatar(newAvatar)
    setAgentName(newName)

    // Reset messages and options with saved userName
    setAgentMessages([
      `Hello, ${userName}! I'm ${newName},\nyour new real estate assistant.`
    ])
    setQuestionOptions(initialQuestions)
  }

  const restartDialog = () => {
    resetAgent()
    // Clear current messages and reset to initial state
    setAgentMessages(["Let's start fresh! What can I do for you today?"])
    setQuestionOptions(initialQuestions)
  }

  const openListingsWithBathrooms = (numBathrooms: number) => {
    const filteredListings = listings.filter((listing) => {
      const bathrooms = listing?.details?.numBathrooms
      return Number(bathrooms) === numBathrooms
    })

    if (filteredListings.length > 0) {
      // Pick any random listing from filtered results
      const selectedListing = getRandomItem(filteredListings)
      const { mlsNumber, boardId } = selectedListing

      // Extract all found pairs
      const filteredListingIds = filteredListings.map((listing) => ({
        mlsNumber: listing.mlsNumber,
        boardId: listing.boardId
      }))

      postMessage({
        type: 'OpenListing',
        payload: {
          boardId,
          mlsNumber,
          filteredListings: filteredListingIds
        }
      })
    }
  }

  const handleQuestionSelect = (option: QuestionOption) => {
    // Hide current options immediately
    setQuestionOptions([])

    // Execute local action immediately if present
    if (option.localAction) {
      const localActions = Array.isArray(option.localAction)
        ? option.localAction
        : [option.localAction]

      for (const action of localActions) {
        switch (action) {
          case 'ChangeAgent':
            changeAgent()
            return // Exit early since changeAgent handles its own flow
          case 'OpenListing':
            openListingsWithBathrooms(4)
            // Don't return - allow nextOptions to be shown
            break
          case 'RestartDialog':
            restartDialog()
            return // Exit early since restartDialog handles its own flow
        }
      }
    }

    setTimeout(() => {
      // Add agent response and new options with delay
      if (option.answer) {
        addAgentMessage(option.answer)
      }

      // Send action if present
      if (option.action) {
        const actions = Array.isArray(option.action)
          ? option.action
          : [option.action]

        for (const action of actions) {
          postMessage(action)
        }
      }

      // Show new follow-up questions if available
      if (option.nextOptions && option.nextOptions?.length > 0) {
        setQuestionOptions(option.nextOptions)
      }
    }, 2000)
  }

  const postMessage = (data: { type: string; payload?: any }) => {
    if (window.parent) {
      const messageData = {
        type: data.type,
        payload: {
          ...(data.payload || {}),
          sessionId
        }
      }
      console.log(
        `%c[${new Date().toISOString()}] SENDING : ${data.type}`,
        'color: orange;',
        messageData.payload
      )
      window.parent.postMessage(messageData, '*')
    }
  }

  const handleMessage = (event: MessageEvent) => {
    const { type, payload } = event.data || {}

    console.log(
      `%c[${new Date().toISOString()}] RECEIVED: ${type}`,
      'color: orange;',
      payload
    )

    switch (type) {
      case 'InitSession': {
        setHandshakeComplete(true)
        const receivedUserName = payload?.userName || 'there'
        setUserName(receivedUserName)
        const welcomeMessage = `Hello, ${receivedUserName}! I'm ${agentName},\nyour real estate assistant.`
        addAgentMessage(welcomeMessage)

        setTimeout(() => {
          postMessage({ type: 'RequestListings' })
          addAgentMessage(
            'Lets see what properties are available here. Do you want me to look for anything specific?'
          )
          setQuestionOptions(initialQuestions)
        }, 2000)
        break
      }
      case 'Listings':
        if (payload?.listings) setListings(payload.listings)
        break
      case 'Filters':
        if (Object.keys(payload?.filters || {}).length > 0) {
          postMessage({
            type: 'ApplyFilters',
            payload: { filters: payload.filters }
          })
        }
        break
      case 'ExtractFilters':
        break
      case 'ListingDetails':
        if (payload?.listing) setListingDetails(payload.listing)
        break
      default:
    }
  }

  // Effect to handle listingDetails changes
  useEffect(() => {
    if (listingDetails?.mlsNumber) {
      addAgentMessage(
        `Would you like me to help you explore the details of listing #${listingDetails.mlsNumber} ?`
      )
    }
  }, [listingDetails])

  useEffect(() => {
    const params = queryString.parse(window.location.search)
    const currentSessionId = params.sessionId as string

    if (currentSessionId && window.parent) {
      const sendReady = () => {
        if (handshakeComplete) return
        postMessage({
          type: 'AgentReady',
          payload: {}
        })
        readyTimeoutRef.current = setTimeout(sendReady, PING_INTERVALS)
      }

      readyTimeoutRef.current = setTimeout(sendReady, 1000)
    }

    return () => {
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current)
        readyTimeoutRef.current = null
      }
    }
  }, [handshakeComplete])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        background: '#ffffff'
      }}
    >
      <div
        style={{
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: `url(${agentAvatar})`
        }}
      />

      <QuestionChips
        options={questionOptions}
        onQuestionSelect={handleQuestionSelect}
      />

      <AgentMessages messages={agentMessages} />
    </div>
  )
}

export default App
