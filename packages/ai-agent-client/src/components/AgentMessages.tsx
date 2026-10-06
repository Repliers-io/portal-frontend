import { useState, useEffect } from 'react'

interface AgentMessagesProps {
  messages: string[]
}

export function AgentMessages({ messages }: AgentMessagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentMessage = messages[currentIndex] || '...'

  const canGoUp = currentIndex > 0
  const canGoDown = currentIndex < messages.length - 1

  const navigateMessage = (direction: 'up' | 'down') => {
    if (direction === 'up' && canGoUp) {
      setCurrentIndex(currentIndex - 1)
    } else if (direction === 'down' && canGoDown) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      setCurrentIndex(messages.length - 1)
    }
  }, [messages.length])

  return (
    <div
      style={{
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        color: '#fff',
        lineHeight: 1.5,
        fontSize: '0.9rem',
        padding: '0.5rem 2rem 0.5rem 0.5rem',
        textAlign: 'center',
        position: 'absolute',
        whiteSpace: 'pre-line',
        backdropFilter: 'blur(8px)',
        background: 'rgba(0, 0, 0, 0.15)'
      }}
    >
      {currentMessage}

      <div
        style={{
          right: '0.5rem',
          bottom: '0.5rem',
          display: 'flex',
          position: 'absolute',
          flexDirection: 'column',
          gap: '0.25rem'
        }}
      >
        <button
          onClick={() => navigateMessage('up')}
          disabled={!canGoUp}
          style={{
            width: '20px',
            height: '20px',
            lineHeight: '20px',
            textAlign: 'center',
            border: 'none',
            color: '#FFF',
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: '50%',
            opacity: canGoUp ? 1 : 0,
            pointerEvents: canGoUp ? 'auto' : 'none',
            background: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          ▴
        </button>
        <button
          onClick={() => navigateMessage('down')}
          disabled={!canGoDown}
          style={{
            width: '20px',
            height: '20px',
            lineHeight: '20px',
            textAlign: 'center',
            border: 'none',
            color: '#FFF',
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: '50%',
            opacity: canGoDown ? 1 : 0,
            pointerEvents: canGoDown ? 'auto' : 'none',
            background: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          ▾
        </button>
      </div>
    </div>
  )
}
