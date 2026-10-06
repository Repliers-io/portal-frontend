import React from 'react'

import { Box, Link, Typography } from '@mui/material'

import {
  WidgetMdxParagraph,
  WidgetMdxRenderer
} from '@shared/CmsContentRenderer'

import type { MDXComponents } from 'mdx/types'

// GitHub-style heading slug, e.g. "Forms & utility widgets" -> "forms-utility-widgets".
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

// MDX heading children may be a string, a number, or nested inline elements
// (e.g. inline code). Flatten to plain text so the slug is stable.
const flattenText = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(flattenText).join('')
  if (React.isValidElement(node)) {
    return flattenText((node.props as { children?: React.ReactNode }).children)
  }
  return ''
}

// Headings carry a slug id so a table of contents can anchor-link to them;
// scrollMarginTop keeps the target clear of the sticky header.
const Heading = ({
  variant,
  children
}: {
  variant: 'h1' | 'h2' | 'h3'
  children?: React.ReactNode
}) => (
  <Typography
    id={slugify(flattenText(children))}
    variant={variant}
    sx={{ scrollMarginTop: 'var(--scroll-offset, 96px)' }}
  >
    {children}
  </Typography>
)

// You can customize global MDX components here: h1, h2, h3, p, a, etc.
// https://nextjs.org/docs/pages/building-your-application/configuring/mdx#global-styles-and-components
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Widget: WidgetMdxRenderer, // Add Widget component for embedding widgets in MDX
    a: ({ href, children, ...rest }) => {
      // In-page anchor links (table of contents) stay in the same tab;
      // external links keep opening in a new tab.
      const anchor = typeof href === 'string' && href.startsWith('#')
      return (
        <Link
          href={href}
          {...(anchor ? {} : { target: '_blank', rel: 'noreferrer' })}
          {...rest}
        >
          {children}
        </Link>
      )
    },
    strong: (props) => (
      <Typography component="strong" fontWeight="900">
        {props.children}
      </Typography>
    ),
    h1: ({ children }) => <Heading variant="h1">{children}</Heading>,
    h2: ({ children }) => <Heading variant="h2">{children}</Heading>,
    h3: ({ children }) => <Heading variant="h3">{children}</Heading>,
    p: WidgetMdxParagraph, // Custom paragraph that parses [Widget...] syntax
    // Fenced code block: literal container, never parsed as a widget.
    // Resets nested inline-code styling so it renders as a plain block.
    pre: (props) => (
      <Box
        component="pre"
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'grey.100',
          color: 'text.primary',
          fontFamily: 'monospace',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          overflowX: 'auto',
          '& code': { p: 0, bgcolor: 'transparent', fontSize: 'inherit' }
        }}
        {...(props as object)}
      />
    ),
    // Inline code: subtle highlight; reset to plain when nested inside <pre> above.
    code: (props) => (
      <Box
        component="code"
        sx={{
          px: 0.5,
          py: '2px',
          borderRadius: 0.5,
          bgcolor: 'grey.100',
          fontFamily: 'monospace',
          fontSize: '0.85em'
        }}
        {...(props as object)}
      />
    ),
    // ul/ol/li intentionally NOT mapped: native lists are styled by
    // CmsContentRenderer contentStyles, matching blog and other HTML pages.
    ...components
  }
}
