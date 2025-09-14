import { useEffect, useState } from 'react'

const TypingText = ({
  text,
  speed = 20,
  animate = true,
  onTyping,
  onTypingEnd
}: {
  text: string
  speed?: number
  animate?: boolean
  onTyping?: (chars: number) => void
  onTypingEnd?: () => void
}) => {
  const [displayedText, setDisplayedText] = useState(
    animate ? text[0] || '' : text
  )

  useEffect(() => {
    if (!animate) {
      onTypingEnd?.()
      return
    }

    let currentText = text[0]
    let index = 1

    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index]
        setDisplayedText(currentText)
        index++
        // call onTyping every 30 characters
        if (index % 10 === 0) onTyping?.(index)
      } else {
        clearInterval(interval)
        onTypingEnd?.()
      }
    }, speed)

    // eslint-disable-next-line consistent-return
    return () => clearInterval(interval)
  }, [text, speed])

  if (!text.length) return null

  return <span>{displayedText}</span>
}

export default TypingText
