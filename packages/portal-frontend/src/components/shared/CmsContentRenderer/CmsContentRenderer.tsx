import React from 'react'

import type { PageLayout } from 'services/CMS/types'

import { contentStyles } from './styles'

import {
  GhostRenderer,
  GutenbergRenderer,
  HtmlRenderer,
  MarkdownRenderer,
  MdxRenderer,
  WordPressRawRenderer
} from './renderers'

export type ContentFormat =
  | 'html'
  | 'gutenberg'
  | 'ghost'
  | 'mdx'
  | 'raw'
  | 'markdown'

type CmsContentRendererProps = {
  content: string | React.ComponentType
  format?: ContentFormat
  // 'custom'-layout pages bring their own design, so predefined typography is skipped
  layout?: PageLayout
}

/**
 * Renders content from various CMS formats with consistent typography and styling
 *
 * Supported formats:
 * - html: Raw HTML content (default)
 * - raw: WordPress raw content with autop (converts \n\n to <p>, \n to <br>)
 * - gutenberg: WordPress Gutenberg blocks
 * - ghost: Ghost CMS content in Mobiledoc/Lexical format (TODO: implement Ghost transformer)
 * - mdx: Pre-compiled MDX React components from static files (
 * - markdown: Markdown string parsed to HTML via marked, then sanitized (server-only)
 *
 * The renderer automatically detects MDX components (React.ComponentType) and applies the same styles
 *
 * ## Content Processing Pipeline
 *
 * ### HTML/Gutenberg/Ghost (string content):
 * 1. Content string passed to respective renderer (HtmlRenderer/GutenbergRenderer/GhostRenderer)
 * 2. Renderer calls `renderHtmlWithWidgets(content)`
 * 3. `processShortcodes(content)` - replaces/removes WordPress shortcodes based on blogConfig
 *    - Replaces: [building-form] → [BuildingContactWidget]
 *    - Removes : [optima_express_*] and other configured prefixes
 * 4. `extractWidgets(content)` - parses [WidgetName param="value"] syntax
 * 5. Returns React elements with widgets rendered via WidgetRenderer
 *
 * ### MDX (React component):
 * 1. MDX component renders with custom MDX components (from mdx-components.tsx)
 * 2. Paragraphs use `WidgetMdxParagraph` component
 * 3. If paragraph contains [Widget...] syntax:
 *    - Calls `renderHtmlWithWidgets(textContent)`
 *    - Same pipeline as HTML: processShortcodes → extractWidgets → WidgetRenderer
 * 4. JSX widgets like `<Widget name="..." />` render directly via WidgetMdxRenderer
 *    - ⚠️ JSX syntax ONLY works in MDX files, NOT in HTML/string content
 *    - For HTML/string content use: [WidgetName param="value"] syntax
 *
 * ## Widget Syntax Summary:
 * - `[CarouselWidget param="value"]` - Works in ALL formats (HTML, MDX, Gutenberg, Ghost)
 * - `<Widget name="CarouselWidget" param="value" />` - ONLY works in MDX files (JSX syntax)
 *
 * ### Result:
 * All formats support:
 * - WordPress shortcode processing (replacement/removal)
 * - Widget embedding via [WidgetName ...] syntax
 * - Consistent typography and styling
 */
export const CmsContentRenderer = ({
  content,
  format,
  layout
}: CmsContentRendererProps) => {
  // 'custom' movesmartly pages (about/buy/sell/reviews/jobs) self-style;
  // CMS content gets predefined typography
  const sx = layout === 'custom' ? undefined : contentStyles

  // Auto-detect MDX components
  if (typeof content === 'function') {
    return <MdxRenderer content={content} sx={sx} />
  }

  // Handle string content
  switch (format) {
    case 'gutenberg':
      return <GutenbergRenderer content={content} />
    case 'ghost':
      return <GhostRenderer content={content} sx={sx} />
    case 'raw':
      return <WordPressRawRenderer content={content} sx={sx} />
    case 'markdown':
      return <MarkdownRenderer content={content} sx={sx} />
    case 'html':
    default:
      return <HtmlRenderer content={content} sx={sx} />
  }
}
