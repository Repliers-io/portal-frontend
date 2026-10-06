import { type SxProps, type Theme } from '@mui/material'

import typography from '@configs/theme/typography'

import { toRem } from 'utils/theme'

/**
 * Helper to exclude widget content from styles
 * Accepts single selector or array of selectors
 */
const excludeWidgets = (selectors: string | string[]) => {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors]
  return selectorArray.map((s) => `& ${s}:not(.repliers-widget *)`).join(', ')
}

// Bold/strong text uses the heading font family (e.g. urbn's secondary font). Tenants whose
// headings inherit the body font set no fontFamily here, so this is a no-op for them.
const headingFontFamily = (typography.h2 as { fontFamily?: string }).fontFamily

const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/**
 * Common typography and content styles
 * Used across all CMS content renderers
 */
export const contentStyles: SxProps<Theme> = {
  fontFamily: typography.fontFamily,
  fontSize: toRem(16),
  lineHeight: 1.75,

  // HTML fragment wrappers injected by renderHtmlWithWidgets have no class.
  // display:contents collapses them so their children participate directly
  // in Box layout — :first-child/:last-child selectors work correctly.
  '& > div:not([class])': {
    display: 'contents'
  },

  // Direct first child with no wrapper (other renderers)
  '& > :first-child': {
    mt: 0
  },

  // First element inside the first fragment wrapper (renderHtmlWithWidgets)
  '& > div:not([class]):first-child > :first-child': {
    mt: 0
  },

  '& > *:last-of-type': {
    mb: 0
  },

  // Widget wrappers are excluded from all content rules above, so they carry no
  // bottom margin of their own. The content rhythm is margin-bottom-only (the next
  // element has no margin-top), so a widget followed by text would sit flush against
  // it. Restore the rhythm by giving the wrapper the same gap as a paragraph.
  '& .repliers-widget': {
    mb: 2
  },

  // Consecutive widgets are full-bleed bands that must butt together — the rhythm
  // gap above would otherwise show the page background between them. Collapse it
  // whenever a widget is immediately followed by another widget (any run length).
  '& .repliers-widget:has(+ .repliers-widget)': {
    mb: 0
  },

  // Headings - generated algorithmically
  // (cast keeps the dynamic map from blowing up the sx union — TS2590)
  ...(Object.fromEntries(
    headingTags.map((tag) => [
      excludeWidgets(tag),
      {
        ...(typography[tag as keyof typeof typography] as object),
        my: 2
      }
    ])
  ) as Record<string, object>),

  [excludeWidgets('p')]: {
    mb: 2,
    lineHeight: 1.5,
    fontFamily: 'inherit'
  },

  [excludeWidgets('a')]: {
    color: 'primary.main',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },

  [excludeWidgets(['ul', 'ol'])]: {
    mx: 0,
    my: 2,
    paddingLeft: 0,
    marginLeft: '1.2rem',
    listStylePosition: 'outside'
  },

  [excludeWidgets('li')]: {
    paddingLeft: '0.5rem'
  },

  [excludeWidgets('blockquote')]: {
    borderLeft: 4,
    borderColor: 'primary.main',
    px: 2,
    py: 1,
    my: 3,
    mx: 2,
    fontStyle: 'italic',
    color: 'text.secondary',
    bgcolor: 'grey.50'
  },

  [excludeWidgets('img')]: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 1,
    display: 'block',
    margin: '0 auto'
  },

  [excludeWidgets('iframe')]: {
    maxWidth: '100%',
    display: 'block',
    margin: '0 auto',
    borderRadius: 1,
    overflow: 'hidden'
  },

  [excludeWidgets('figure')]: {
    m: 0,
    my: 3
  },

  [excludeWidgets('figcaption')]: {
    mt: 1,
    fontSize: '0.875rem',
    color: 'text.secondary',
    textAlign: 'center'
  },

  [excludeWidgets('pre')]: {
    p: 2,
    mb: 2,
    borderRadius: 1,
    bgcolor: 'grey.900',
    color: 'grey.50',
    overflow: 'auto',
    fontSize: '0.875rem'
  },

  [excludeWidgets('code')]: {
    bgcolor: 'grey.100',
    px: 0.5,
    py: 0.25,
    borderRadius: 0.5,
    fontFamily: 'monospace',
    fontSize: '0.875em'
  },

  [`${excludeWidgets('pre')} code`]: {
    bgcolor: 'transparent',
    p: 0,
    fontSize: 'inherit',
    color: 'inherit'
  },

  [excludeWidgets('table')]: {
    my: 3,
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
    display: { xs: 'block', sm: 'table' },
    width: { xs: 'max-content', sm: '100%' },
    maxWidth: '100%',
    overflowX: { xs: 'auto', sm: 'unset' }
  },

  [excludeWidgets(['th', 'td'])]: {
    border: 1,
    borderColor: 'divider',
    p: 1.5,
    textAlign: 'left'
  },

  [excludeWidgets('th')]: {
    bgcolor: 'grey.100',
    fontWeight: 600
  },

  [excludeWidgets('hr')]: {
    my: 3,
    border: 'none',
    borderTop: 1,
    borderColor: 'divider'
  },
  [excludeWidgets(['strong', 'b'])]: {
    fontWeight: 600,
    // Match headings' font (sizes are inherited, so they stay unchanged)
    ...(headingFontFamily && { fontFamily: headingFontFamily })
  },

  // CMS content sometimes wraps heading text in <strong>/<b>. Suppress the standalone
  // bold rule above for those so the whole heading renders in the heading style — the
  // nested tag inherits the heading's own weight and font instead of forcing 600.
  [headingTags
    .flatMap((tag) =>
      ['strong', 'b'].map((bold) => `& ${tag} ${bold}:not(.repliers-widget *)`)
    )
    .join(', ')]: {
    fontWeight: 'inherit',
    fontFamily: 'inherit'
  },

  // Gutenberg: text alignment is a class, styled by WP's block-library CSS we don't load
  '& .has-text-align-center': {
    textAlign: 'center'
  },

  // Gutenberg: Columns
  '& .wp-block-columns': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4
  },
  '& .wp-block-column': {
    flexGrow: { xs: 0, sm: 1 },
    flexShrink: 1,
    flexBasis: { xs: '100%', sm: 0 },
    minWidth: 0,
    '& > *:first-child': { mt: 0 },
    '& > *:last-child': { mb: 0 }
  },

  // Gutenberg: Buttons — uses 2-class selector to win over & a:not(.repliers-widget *)
  '& .wp-block-buttons': {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 1,
    pb: 1
  },
  '& .wp-block-button': {
    width: { xs: '100%', sm: 'auto' }
  },
  '& .wp-block-button .wp-block-button__link': {
    ...(typography.button as object),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: { xs: '100%', sm: 'auto' },
    bgcolor: 'primary.main',
    color: 'common.white',
    px: 2,
    height: '48px',
    borderRadius: 1,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'background-color 0.2s',
    '&:hover': {
      bgcolor: 'primary.dark',
      color: 'primary.contrastText',
      textDecoration: 'none'
    }
  }
}
