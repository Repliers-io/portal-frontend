'use client'

import { useEffect } from 'react'

// Instagram posts each embed's real height (MEASURE) — the same channel its own embed.js sizes by.
const fitInstagramEmbed = ({ origin, source, data }: MessageEvent) => {
  if (origin !== 'https://www.instagram.com') return
  const { type, details } = JSON.parse(data)
  if (type !== 'MEASURE') return
  const frame = Array.from(document.querySelectorAll('iframe')).find(
    (iframe) => iframe.contentWindow === source
  )
  if (frame) frame.style.height = `${details.height}px`
}

export const InstagramEmbedSizer = () => {
  useEffect(() => {
    window.addEventListener('message', fitInstagramEmbed)
    return () => window.removeEventListener('message', fitInstagramEmbed)
  }, [])

  return null
}
