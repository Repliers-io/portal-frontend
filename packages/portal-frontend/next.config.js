/** @type {import('next').NextConfig} */

import { PHASE_PRODUCTION_BUILD } from 'next/constants.js'
import createNextIntlPlugin from 'next-intl/plugin'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

import createMDX from '@next/mdx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Read a generated JSON file from the package root, returning an empty array if missing.
 * Files are produced by `scripts/generate-rewrites.ts` during prebuild.
 */
const readJson = (filename) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf-8'))
  } catch {
    return []
  }
}

const currentEnv = process.env.NODE_ENV
const enableSourceMaps = process.env.NEXT_ENABLE_SOURCEMAP === 'true'

// Next's own default worker count for static generation (experimental.cpus),
// overridable via a NEXT_BUILD_WORKERS var on the build host. Exposed to app
// code (inlined) so the build-time API rate limiter (utils/throttle.ts) can
// split the global NEXT_BUILD_API_RPS budget between worker processes.
const cpuCount = (os.cpus() || { length: 1 }).length
const buildWorkers =
  Number(process.env.NEXT_BUILD_WORKERS) || Math.max(1, cpuCount - 1)

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  env: {
    NEXT_BUILD_WORKERS: String(buildWorkers)
  },
  // postcss (pulled in server-side via sanitize-html) sits on Next's default
  // server-externals list; Turbopack then requires it at runtime under a
  // build-path-derived hashed name ('postcss-<hash>') that dies when Heroku
  // relocates the slug from /tmp/build_* to /app (vercel/next.js#87737).
  // Bundling it removes the runtime require entirely.
  transpilePackages: ['postcss'],
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
  productionBrowserSourceMaps: enableSourceMaps,
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: currentEnv == 'development'
    },
    incomingRequests: currentEnv == 'development'
  },
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx', 'md'],
  // Note: the `eslint` config key was removed in Next.js 16 (`next build` no
  // longer runs linting). Lint separately via `pnpm run lint`.
  trailingSlash: false,
  reactStrictMode: true,
  deploymentId:
    readJson('deployment-id.generated.json').id || 'local-deployment',
  // One year (Next's default) assumes a CDN that invalidates on deploy and keeps
  // old chunks servable; self-hosted, chunks die with the slug, so that window
  // hands browsers HTML that outlives its own JavaScript. Keep this ABOVE the
  // largest route `revalidate` (86400) — below it `expire` precedes `revalidate`
  // and every ISR refresh becomes a blocking render instead of a background one.
  expireTime: 90000,
  // The custom Redis cacheHandler is a self-hosting artifact (Heroku). On Vercel
  // it is both redundant (Vercel provides its own cache) and harmful — the file
  // is not traced into the serverless bundle, so dynamic SSR pages crash with
  // ERR_MODULE_NOT_FOUND. Skip it on Vercel; keep it for self-hosted deploys.
  cacheHandler:
    process.env.NODE_ENV === 'production' && !process.env.VERCEL
      ? path.join(__dirname, 'cache-handler.js')
      : undefined,
  cacheMaxMemorySize:
    process.env.NODE_ENV === 'production' && !process.env.VERCEL
      ? 0
      : undefined,
  typescript: {
    ignoreBuildErrors: true
  },
  // For Next.js 15.3.0 and later
  // turbopack: {
  //   resolveAlias: {
  //     ...buildOverrideAliasMap()
  //   }
  // },
  experimental: {
    // typedRoutes: true, // TODO: unlock it in the future
    // One source of truth for build parallelism: the same value feeds the
    // rate-limiter split (env.NEXT_BUILD_WORKERS), so the NEXT_BUILD_API_RPS
    // budget can never disagree with the real worker count.
    cpus: buildWorkers,
    // Other static generation knobs (defaults per next/dist/server/config-shared):
    // memoryBasedWorkersCount: true, // derive worker count from available RAM instead of CPUs
    // staticGenerationMaxConcurrency: 8, // pages rendered concurrently INSIDE one worker
    // staticGenerationMinPagesPerWorker: 25, // min pages before spawning another worker
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@emotion/react',
      'recharts'
    ]
  },
  // Increase timeout for static page generation (default is 60 seconds)
  staticPageGenerationTimeout: 180,
  /**
   * Rewrites are generated at pre-build time by scripts/generate-rewrites.ts.
   * They cover: rootPage feature flag, stateCode URL alias, and instance-specific
   * static URL aliases (previously hardcoded in middleware.ts).
   *
   * Using `beforeFiles` so that feature-flag rewrites (e.g. / → /estimate) take
   * precedence over existing filesystem pages (src/app/page.tsx).  A flat array
   * would be treated as "afterFiles" and would never fire when a page already
   * matches the source path.
   */
  async rewrites() {
    return {
      beforeFiles: readJson('rewrites.generated.json'),
      afterFiles: [],
      fallback: []
    }
  },
  /**
   * Redirects are generated at pre-build time by scripts/generate-rewrites.ts.
   */
  async redirects() {
    return readJson('redirects.generated.json')
  },
  // Cross-origin settings for iframe and postMessage communication
  async headers() {
    const securityHeaders = [
      {
        // Prevent search engines from indexing OAuth callback pages
        source: '/auth/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }]
      },
      {
        // Build assets must stay crawlable — Google needs the JS/CSS to render
        // the page — but must never be indexed as standalone documents. A
        // robots.txt Disallow does the opposite: it hides this directive and
        // freezes already-indexed chunk URLs in the index (see proxy.ts).
        source: '/_next/static/(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }]
      }
    ]

    const aiAgentUrl = process.env.NEXT_PUBLIC_AI_AGENT_IFRAME_URL || ''
    const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || ''

    if (!aiAgentUrl) {
      // Most tenants don't enable the embedded AI agent — skip its iframe CSP silently.
      return securityHeaders
    }
    if (!baseUrl) {
      // App domain unset (non-agent tenants) — skip the agent iframe CSP silently.
      return securityHeaders
    }

    // Extract origins for CSP
    const aiAgentOrigin = new URL(aiAgentUrl).origin
    const appOrigin = new URL(baseUrl).origin

    return [
      ...securityHeaders,
      {
        // source: '/(.*)',
        // Allow iframe embedding only for search routes where AI Agent is used
        source: '/search/(.*)',
        headers: [
          {
            // Content Security Policy - defines which domains can embed this page in iframe
            // 'self' = current domain, followed by allowed domains from env variables
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' ${appOrigin} ${aiAgentOrigin};`
          }
        ]
      }
    ]
  },
  images: {
    minimumCacheTTL: 86400,
    path: '/_next/image',
    contentDispositionType: 'attachment',
    disableStaticImages: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.repliers.io'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      }
    ]
  }
}

const withMDX = createMDX({})

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const withAnalyzer =
  process.env.ANALYZE === 'true'
    ? (await import('@next/bundle-analyzer')).default({ enabled: true })
    : (x) => x

const config = withAnalyzer(withNextIntl(withMDX(nextConfig)))

export default function configWithBuildInfo(phase) {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const rps = Number(process.env.NEXT_BUILD_API_RPS) || 5 // default mirrors utils/throttle.ts
    const workersSource = Number(process.env.NEXT_BUILD_WORKERS)
      ? 'from NEXT_BUILD_WORKERS env'
      : `computed: ${cpuCount} CPUs − 1`
    const rpsSource = Number(process.env.NEXT_BUILD_API_RPS)
      ? 'from NEXT_BUILD_API_RPS env'
      : 'default'
    // eslint-disable-next-line no-console
    console.log(
      `[build] prerender workers: ${buildWorkers} (${workersSource}) | ` +
        `sitemap warm-up throttle: ${rps} rps (${rpsSource}) → ` +
        `${Math.round((1000 * buildWorkers) / rps)}ms/request per worker`
    )
  }
  return config
}
