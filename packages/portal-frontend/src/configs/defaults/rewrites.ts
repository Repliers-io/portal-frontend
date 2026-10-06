import type { Redirect, Rewrite } from 'next/dist/lib/load-custom-routes'

/**
 * Per-instance static URL rewrites and redirects consumed by next.config.js.
 * These are merged with generated rewrites (GrowthBook features, locationConfig) at pre-build time.
 *
 * Rewrite  — URL stays the same in browser, page content changes
 * Redirect — browser navigates to the new URL
 */
const rewrites: Rewrite[] = [
  // Standard content pages → unified /page/* handler
  // These provide pretty URLs for pages that exist in content/defaults/
  { source: '/privacy-policy', destination: '/page/privacy-policy' },
  { source: '/terms-of-use', destination: '/page/terms-of-use' },
  { source: '/cookies-policy', destination: '/page/cookies-policy' },
  { source: '/dmca-notice', destination: '/page/dmca-notice' },
  { source: '/accessibility', destination: '/page/accessibility' },
  { source: '/contact-us', destination: '/page/contact-us' },
  { source: '/subscribe', destination: '/page/subscribe' },
  { source: '/about', destination: '/page/about' }
]

const redirects: Redirect[] = []

export default { rewrites, redirects }
