import React from 'react'

import { replaceYouTubeWithIframe } from 'utils/youtube'

import { InstagramEmbedSizer, WidgetRenderer } from '../components'

import { replaceInstagramWithIframes } from './instagram'
import { processShortcodes } from './processShortcodes'
import { extractWidgets } from './widgetParser'

/**
 * Server-side function to render HTML content with embedded widgets
 * Parses text content, extracts [WidgetName] tags, and returns React elements
 * Widgets are rendered in the same React tree with access to all contexts
 */
export function renderHtmlWithWidgets(content: string) {
  // Process shortcodes before extracting widgets
  const processedContent = processShortcodes(content)

  // Replace YouTube and Instagram URLs with iframe embeds
  const contentWithYouTube = replaceYouTubeWithIframe(processedContent)
  const contentWithEmbeds = replaceInstagramWithIframes(contentWithYouTube)

  const { content: textContent, widgets } = extractWidgets(contentWithEmbeds)

  // Parse HTML and create React elements
  const elements: React.ReactNode[] = []

  // Split by widget placeholders
  const parts = textContent.split(
    /(<span repliers-widget-placeholder="\d+"><\/span>)/
  )

  parts.forEach((part, index) => {
    // Check if it's a widget placeholder
    const placeholderMatch = part.match(/repliers-widget-placeholder="(\d+)"/)

    if (placeholderMatch) {
      const widgetIndex = parseInt(placeholderMatch[1], 10)
      const widget = widgets[widgetIndex]

      if (widget) {
        elements.push(
          <WidgetRenderer key={`widget-${index}`} widget={widget} />
        )
      }
    } else if (part.trim()) {
      // Regular HTML content — div avoids invalid nesting (<span> cannot contain block elements)
      elements.push(
        <div key={`text-${index}`} dangerouslySetInnerHTML={{ __html: part }} />
      )
    }
  })

  if (contentWithEmbeds !== contentWithYouTube) {
    elements.push(<InstagramEmbedSizer key="instagram-sizer" />)
  }

  return elements
}
