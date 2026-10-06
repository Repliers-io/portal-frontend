import React from 'react'

import { Box } from '@mui/material'

const safeHrefPattern = /^(https?:\/\/|\/|mailto:)/
const inlineTags = new Set(['b', 'i', 'em', 'strong', 'u', 's'])

/**
 * Strips all HTML tags from a string except:
 * - <a href="..."> with a safe href (http/https/relative/mailto)
 * - Inline formatting tags: <b> <i> <em> <strong> <u> <s> (attributes stripped)
 * - <br>
 * Reconstructed <a> tags always include target="_blank" rel="noopener noreferrer".
 */
export const sanitize = (html: string): string => {
  let inStrippedAnchor = false
  return html.replace(/<[^>]*>/g, (tag) => {
    if (/^<a[\s>]/i.test(tag)) {
      const hrefMatch = tag.match(
        /href="([^"]*)"|href='([^']*)'|href=([^\s>"']+)/
      )
      const href = hrefMatch
        ? (hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? null)
        : null
      if (!href || !safeHrefPattern.test(href)) {
        inStrippedAnchor = true
        return ''
      }
      inStrippedAnchor = false
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">`
    }
    if (/^<\/a>/i.test(tag)) {
      if (inStrippedAnchor) {
        inStrippedAnchor = false
        return ''
      }
      return '</a>'
    }
    if (/^<br[\s/]*>$/i.test(tag)) {
      return '<br>'
    }
    const openMatch = tag.match(/^<([a-zA-Z]+)[\s>]/)
    if (openMatch && inlineTags.has(openMatch[1].toLowerCase())) {
      return `<${openMatch[1].toLowerCase()}>`
    }
    const closeMatch = tag.match(/^<\/([a-zA-Z]+)>$/)
    if (closeMatch && inlineTags.has(closeMatch[1].toLowerCase())) {
      return `</${closeMatch[1].toLowerCase()}>`
    }
    return ''
  })
}

/**
 * Renders widget title / subtitle text with limited HTML support.
 * Allowed: <a href="...">, <b>, <i>, <em>, <strong>, <u>, <s>, <br>.
 * All other HTML is stripped.
 */
export const WidgetHtmlText = ({ children }: { children?: string }) => {
  if (!children) return null
  return (
    <Box
      component="span"
      dangerouslySetInnerHTML={{ __html: sanitize(children) }}
      sx={{
        a: {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' }
        }
      }}
    />
  )
}
