import { type SxProps, type Theme } from '@mui/material'

import { markdownToSafeHtml } from 'services/CMS'

import { HtmlRenderer } from './HtmlRenderer'

type MarkdownRendererProps = {
  content: string
  sx?: SxProps<Theme>
}

/**
 * Renders markdown content (e.g. job descriptions from the MoveSmartly API).
 * Parses markdown to HTML, sanitizes it, then reuses the HTML pipeline for
 * widgets and shared typography. Server-only: keeps marked/sanitize-html out of
 * the client bundle, so render this above the client boundary.
 *
 * breaks: true keeps single line breaks as <br>, matching the previous pre-line layout.
 */
export const MarkdownRenderer = ({ content, sx }: MarkdownRendererProps) => (
  <HtmlRenderer content={markdownToSafeHtml(content)} sx={sx} />
)
