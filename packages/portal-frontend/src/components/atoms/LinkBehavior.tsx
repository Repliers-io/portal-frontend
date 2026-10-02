'use client'

import { type AnchorHTMLAttributes, forwardRef } from 'react'
import NextLink, { type LinkProps } from 'next/link'

/**
 * LinkBehavior — the single bridge between `next/link` and MUI.
 *
 * ─── Why this exists (the Next.js 16 root cause) ──────────────────────────────
 * MUI's idiomatic way to make a Button/Link navigate is `component={Link}`:
 *
 *     <Button component={Link} href="/buy">…</Button>   // ❌ breaks in Next 16
 *
 * That passes `Link` — a **function/component** — as a *prop* from a Server
 * Component into a Client Component (MUI's ButtonBase is `'use client'`). In the
 * React Server Components model, only **serializable** values may cross the
 * server→client boundary; functions may not. This rule always existed, but:
 *
 *   • Next 15 built our app fine (it didn't enforce it at prerender), whereas
 *   • Next 16 **fails the production build** during prerender with
 *     `Error: Functions cannot be passed directly to Client Components …`
 *     (the offending prop is `{component: function, href: "/buy", …}`).
 *
 * The trigger was purely the Next 15→16 upgrade — React (19) and MUI (6) were
 * unchanged. No MUI version can make a component-function serializable; this is
 * an inherent RSC constraint, so the *pattern* has to change.
 *
 * ─── How LinkBehavior fixes it ────────────────────────────────────────────────
 * Instead of every call site passing the `Link` function across the boundary, we
 * register THIS wrapper once, in the MUI theme (see
 * `configs/defaults/theme/components.ts`):
 *
 *     MuiButtonBase: { defaultProps: { LinkComponent: LinkBehavior } }
 *     MuiLink:       { defaultProps: { component:     LinkBehavior } }
 *
 * The theme is created and applied **on the client** (`<ThemeProvider>` is a
 * Client Component, mounted in `app/_providers.tsx`). So MUI swaps in `next/link`
 * client-side, and Server Components only ever pass a plain **`href` string** —
 * which serializes cleanly. The function never crosses the boundary. Call sites
 * become simply:
 *
 *     <Button href="/buy">…</Button>                    // ✅ client-side nav, no prop-function
 *
 * This is the MUI-recommended integration pattern:
 *   https://mui.com/material-ui/integrations/routing/
 *
 * ─── Edge cases ───────────────────────────────────────────────────────────────
 * A few MUI elements (Chip, Stack, Box, Typography, PaginationItem) don't accept
 * `href` in their types without an explicit `component`. The theme default only
 * covers ButtonBase/Link, so those pass `component={LinkBehavior}` directly (in
 * Client Components) or `component="a"` (in Server Components — a serializable
 * string, at the cost of full-page nav). See `RSC_LINK_CODEMOD_REPORT.md` at the
 * repo root for the exact list.
 *
 * Falls back to a plain `<a>` when no `href` is provided (e.g. a Link used purely
 * as an onClick target), so next/link never receives an empty href.
 */

type LinkBehaviorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<LinkProps, 'href'> & { href?: LinkProps['href'] }

export const LinkBehavior = forwardRef<HTMLAnchorElement, LinkBehaviorProps>(
  function LinkBehavior({ href, ...other }, ref) {
    if (href == null || href === '') {
      return <a ref={ref} {...other} />
    }
    return <NextLink ref={ref} href={href} {...other} />
  }
)
