'use client'

import { usePathname } from 'next/navigation'

/**
 * `usePathname()` with the root route read as `/`. Vercel's ISR background regeneration
 * renders the root route with the pathname `/index`, which would bake the non-home variant
 * of pathname-driven UI into the cached HTML.
 *
 * Upstream bug: https://github.com/vercel/next.js/issues/95648
 * Upstream fix (normalizes `/index` to `/` for minimal-mode root requests):
 * https://github.com/vercel/next.js/pull/95973
 *
 * TEMPORARY — once a `next` release containing that fix is installed, delete this hook and
 * return its callers to `usePathname()` from `next/navigation` (`grep usePagePathname`
 * finds every one).
 */
export const usePagePathname = () => {
  const pathname = usePathname()
  return pathname === '/index' ? '/' : pathname
}
