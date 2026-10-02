import { type NextRequest, NextResponse } from 'next/server'

import content from '@configs/content'
import routes from '@configs/routes'

// import storageConfig from '@configs/storage' // only used by the disabled GrowthBook cookie below
import redirectsGenerated from '../redirects.generated.json'
import rewritesGenerated from '../rewrites.generated.json'

// const { growthBookKey } = storageConfig // see disabled GrowthBook UUID cookie below

/**
 * Static path prefixes that are always allowed through the route guard.
 * These are internal Next.js / asset paths that should never be redirected to /404.
 */
const staticRoutes = [
  '/_next/',
  '/api/',
  '/auth',
  '/images/',
  '/static/',
  '/favicon',
  '/404',
  '/unsubscribe'
]

type Environment = 'production' | 'development'

/**
 * Host suffixes that always identify a non-production deployment:
 *   - `.condosportal.ca` — the shared per-tenant dev sites (dev-<tenant>-com.condosportal.ca)
 *   - `.vercel.app` / `.herokuapp.com` — platform default domains, publicly crawlable
 * Production tenants are only ever served from their own custom domains and never
 * from these suffixes, so this is a safe, tenant-agnostic marker. A live tenant's
 * dev mirror is byte-identical to production (noIndex: false) and would otherwise
 * be fully indexable.
 */
const previewHostSuffixes = [
  '.condosportal.ca',
  '.vercel.app',
  '.herokuapp.com'
]

const decode = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Route-guard allowlist, built once per module load: asset prefixes, every
 * `@configs/routes` value, and the static prefix of every generated rewrite /
 * redirect source (rewrites.generated.json + redirects.generated.json — the same
 * files next.config.js consumes). Stripping dynamic segments (/:param, /:path*)
 * lets startsWith() cover nested paths like /ma/boston. A source that starts
 * with a dynamic segment (/:year/…) or is host-scoped (`has`) has no usable
 * prefix and is skipped — mapping it to '/' would match every path and silently
 * disable the guard. Entries are percent-decoded once so emoji and other
 * non-ASCII slugs match regardless of escape-sequence case (%F0… vs %f0…).
 */
const generatedRules: { source: string; has?: unknown }[] = [
  ...rewritesGenerated,
  ...redirectsGenerated
]

const knownRoutes = [
  ...staticRoutes,
  ...Object.values(routes).filter((route) => route && route !== '/'),
  ...generatedRules
    .filter((rule) => !rule.has)
    .map((rule) => rule.source.split('/:')[0])
    .filter(Boolean)
].map(decode)

/**
 * Proxy (formerly middleware) handles only true per-request runtime logic:
 *   - HTTPS enforcement
 *   - Route guard (unknown paths → /404, or → LEGACY_FALLBACK_HOST when set)
 *   - GrowthBook UUID cookie (disabled — see below)
 *
 * URL rewrites and redirects (stateCode alias, rootPage feature flag,
 * instance-specific aliases) are generated pre-build by
 * scripts/generate-rewrites.ts and served through next.config.js
 * rewrites() / redirects() — zero per-request overhead.
 *
 * Runs on the Node.js runtime (the only runtime `proxy` supports).
 */
export default function proxy(req: NextRequest) {
  const { protocol, host, pathname, search } = req.nextUrl

  const currentEnv = process.env.NODE_ENV as Environment
  const forceHttp = process.env.FORCE_HTTP === 'true'
  const disableRouteGuard = process.env.DISABLE_ROUTE_GUARD === 'true'

  // ── HTTPS enforcement ──────────────────────────────────────────────────────
  // Use === 'http' (not !== 'https') so that internal Next.js mock requests
  // (e.g. the image optimizer's fetchInternalImage) are never redirected.
  // Those mock requests carry no x-forwarded-proto header; without this guard
  // they receive a 301 redirect body instead of image bytes, causing
  // "received null" errors from the image optimizer on production.
  // Heroku always sets x-forwarded-proto for real external requests, so
  // === 'http' still catches all genuine HTTP → HTTPS cases.
  if (
    !forceHttp &&
    currentEnv === 'production' &&
    req.headers.get('x-forwarded-proto') === 'http'
  ) {
    return NextResponse.redirect(`https://${host}${pathname}${search}`, 301)
  }

  // ── Route guard ────────────────────────────────────────────────────────────
  const decodedPathname = decode(pathname)
  const matched = knownRoutes.some((route) => decodedPathname.startsWith(route))

  if (
    !disableRouteGuard &&
    !matched &&
    pathname !== '/' &&
    !pathname.includes('.') // pass through unknown static file extensions
  ) {
    // A tenant whose former site still serves the URLs this domain used to host
    // (e.g. a CMS moved to another subdomain) forwards unknown paths there and
    // lets that site answer 200 or its own 404. Query string kept.
    const legacyHost = process.env.LEGACY_FALLBACK_HOST
    return legacyHost
      ? NextResponse.redirect(`${legacyHost}${pathname}${search}`, 308)
      : NextResponse.redirect(`${protocol}//${host}/404`)
  }

  // ── GrowthBook UUID cookie (DISABLED) ───────────────────────────────────────
  // Previously assigned a random UUID per visitor and stored it in the `growthbook`
  // cookie to serve as a stable anonymous id for GrowthBook experiment/flag bucketing.
  // Disabled because the value was never read back into GrowthBook (createGrowthBook
  // only sets attributes { app, env }), so the cookie had no effect on flag evaluation.
  // To re-enable: uncomment below AND wire `uuid` into createGrowthBook's attributes
  // (e.g. attributes.id) so bucketing actually uses it.
  //
  // let uuid = req.cookies.get(growthBookKey)?.value
  // let needsUpdate = false
  // if (!uuid) {
  //   // NOTE: may need uuidv4() if crypto.randomUUID() is unavailable (JSCore runtime)
  //   uuid = crypto.randomUUID()
  //   needsUpdate = true
  // }
  // const response = NextResponse.next()
  // if (needsUpdate) response.cookies.set(growthBookKey, uuid)
  // return response

  const response = NextResponse.next()

  // Keep every non-production response out of the search index at the HTTP layer.
  // `content.noIndex` covers demo / sample tenants; the preview-host check adds
  // the dev mirror of a LIVE tenant (noIndex: false), whose build is otherwise
  // byte-identical to production and therefore fully indexable. Stronger than the
  // meta tag: it covers non-HTML responses and is honoured without parsing the
  // body. Crawling stays allowed so the directive is seen — never pair this with
  // a robots.txt Disallow, which would stop Google re-crawling and seeing it.
  if (
    content.noIndex ||
    previewHostSuffixes.some((suffix) => host.endsWith(suffix))
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

/**
 * Only run middleware on page/API routes — never on static files.
 *
 * Paths with a file extension (e.g. /urbn/estimate-bg.webp) are excluded so
 * that Next.js internal mock requests from the image optimizer never hit the
 * HTTPS-enforcement or route-guard logic and end up receiving a redirect body
 * instead of image bytes.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.\\w+$).*)'
  ]
}
