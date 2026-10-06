/**
 * Fetches all published posts and pages from WordPress and generates legacy URL rewrite rules.
 *
 * Posts (old WordPress paths) are rewritten to /blog/[path]:
 *   /guides/buying-a-condo  →  /blog/guides/buying-a-condo
 *
 * Pages (static WP pages) are rewritten to /page/[path]:
 *   /contact-us             →  /page/contact-us
 *   /guides/buying          →  /page/guides/buying
 *
 * Output:
 *   src/configs/[instance]/rewrites-legacy.ts
 *
 * This file is automatically picked up by generate-rewrites.ts as source #4
 * during the pre-build step. Commit the file to avoid live WP fetches at build time.
 *
 * Usage:
 *   tsx scripts/generate-legacy-rewrites.ts            # uses NEXT_PUBLIC_APP_CONFIGURATION from .env
 *   tsx scripts/generate-legacy-rewrites.ts urbn       # explicit instance
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// ─── Instance ─────────────────────────────────────────────────────────────────

// 1. Load base .env first so NEXT_PUBLIC_APP_CONFIGURATION is available
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true })

// 2. Resolve instance (CLI arg takes precedence over env var)
const instanceName =
  process.argv[2]?.trim() ||
  String(process.env.NEXT_PUBLIC_APP_CONFIGURATION || '').trim() ||
  'defaults'

// 3. Overlay instance-specific env (instance vars win over base .env)
const instanceEnvFile = path.join(rootDir, `.env.${instanceName}`)
if (fs.existsSync(instanceEnvFile)) {
  dotenv.config({ path: instanceEnvFile, override: true, quiet: true })
}

// Pages → /pages/...
// Skip paths that are already native Next.js routes to avoid accidental rewrites:
// '/' (home), '/blog', '/search', '/locations', '/listing', '/dashboard', '/authors', '/author'
const nativeRoutes = [
  '/blog',
  '/search',
  '/locations',
  '/listing',
  '/dashboard',
  '/authors',
  '/author',
  '/pages',
  '/about'
]
// ─── ANSI colours ────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  grey: '\x1b[90m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

console.log(
  `\n  generate-legacy-rewrites  ${c.grey}instance:${c.reset} ${instanceName}\n`
)

// ─── WordPress config ─────────────────────────────────────────────────────────

const wpBaseUrl = (process.env.WORDPRESS_API_URL || '').replace(/\/$/, '')
const wpUser = process.env.WORDPRESS_API_USER
const wpPassword = process.env.WORDPRESS_API_PASSWORD
const wpApiKey =
  wpUser && wpPassword
    ? `${wpUser}:${wpPassword}`
    : process.env.WORDPRESS_API_KEY
const wpApplicationName = process.env.WORDPRESS_API_APPLICATION_NAME

if (!wpBaseUrl) {
  console.error(
    `  ${c.red}error:${c.reset} WORDPRESS_API_URL is not set for instance "${instanceName}"\n` +
      `         Set it in .env.${instanceName} or .env\n`
  )
  process.exit(1)
}

const isWordPressCom = wpBaseUrl.includes('wordpress.com')

console.log(
  `  WordPress  ${c.grey}${wpBaseUrl}${c.reset}${isWordPressCom ? `  ${c.grey}(wordpress.com)${c.reset}` : ''}`
)
console.log(
  `  auth       ${c.grey}${wpApiKey ? (wpApiKey.includes(':') ? 'Basic (user:password)' : 'Bearer token') : 'none (public)'}${c.reset}\n`
)

// ─── HTTP helpers (mirrors WordPressClient internals, no Next.js deps) ────────

function getApiUrl(endpoint: string): string {
  if (isWordPressCom) {
    const siteDomain = wpBaseUrl.replace(/^https?:\/\//, '')
    return `https://public-api.wordpress.com/wp/v2/sites/${siteDomain}${endpoint}`
  }
  return `${wpBaseUrl}/wp-json/wp/v2${endpoint}`
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (wpApiKey) {
    if (wpApiKey.includes(':')) {
      headers['Authorization'] =
        `Basic ${Buffer.from(wpApiKey).toString('base64')}`
    } else {
      headers['Authorization'] = `Bearer ${wpApiKey}`
    }
  }

  if (wpApplicationName) {
    headers['X-WP-Application-Name'] = wpApplicationName
  }

  return headers
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WpItemMinimal {
  slug: string
  link: string // full canonical URL, e.g. https://urbnlivn.com/guides/buying-a-condo/
}

interface RewriteRule {
  source: string
  destination: string
}

// ─── Generic paginated fetcher ────────────────────────────────────────────────

async function fetchAllItems(
  endpoint: string, // e.g. '/posts' or '/pages'
  label: string // display label for progress output
): Promise<WpItemMinimal[]> {
  const all: WpItemMinimal[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      _fields: 'slug,link',
      status: 'publish'
    })

    const url = getApiUrl(`${endpoint}?${params}`)

    process.stdout.write(
      `  ${c.grey}${label} page ${page}${c.reset}  fetching... `
    )

    const response = await fetch(url, { headers: getHeaders() })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(
        `WordPress API error ${response.status} ${response.statusText}\n  URL: ${url}\n  Body: ${body.slice(0, 200)}`
      )
    }

    const total = response.headers.get('X-WP-Total')
    const totalPages = response.headers.get('X-WP-TotalPages')

    const items: WpItemMinimal[] = await response.json()

    process.stdout.write(
      `${c.green}${items.length} ${label}${c.reset}` +
        (total
          ? `  ${c.grey}(${all.length + items.length}/${total} total)${c.reset}`
          : '') +
        '\n'
    )

    all.push(...items)

    if (items.length < perPage) break
    if (totalPages && page >= Number(totalPages)) break

    page++
  }

  return all
}

// ─── Build rewrite rules ──────────────────────────────────────────────────────

/**
 * Extract the pathname from a full URL, stripping trailing slash.
 * Normalises percent-encoded sequences to uppercase so that generated rewrite
 * sources (e.g. /%F0%9F%8F%A0-…) match the uppercase encoding that browsers
 * send, avoiding case-mismatch failures in the middleware route guard.
 * Returns '' on parse failure.
 */
function extractPath(url: string): string {
  try {
    return (
      new URL(url).pathname
        .replace(/\/$/, '')
        .replace(/%[0-9a-f]{2}/gi, (m) => m.toUpperCase()) || '/'
    )
  } catch {
    return ''
  }
}

/**
 * Build rewrite rules from a list of WP items.
 * @param items     - post or page objects from the WP REST API
 * @param destPrefix - destination path prefix, e.g. '/blog' or '/page'
 * @param skipPrefixes - source paths starting with these are skipped (already handled)
 */
function buildRewrites(
  items: WpItemMinimal[],
  destPrefix: string,
  skipPrefixes: string[] = []
): RewriteRule[] {
  const rules: RewriteRule[] = []
  const seen = new Set<string>()

  for (const item of items) {
    const wpPath = extractPath(item.link)

    if (!wpPath || wpPath === '/') continue

    // Skip items whose paths already start with the destination prefix
    if (skipPrefixes.some((p) => wpPath.startsWith(p))) continue

    if (seen.has(wpPath)) continue
    seen.add(wpPath)

    rules.push({
      source: wpPath,
      destination: `${destPrefix}${wpPath}`
    })
  }

  // Stable alphabetical order for clean git diffs
  rules.sort((a, b) => a.source.localeCompare(b.source))

  return rules
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`  ${c.grey}posts${c.reset}`)
const posts = await fetchAllItems('/posts', 'posts')

console.log(`\n  ${c.grey}pages${c.reset}`)
const wpPages = await fetchAllItems('/pages', 'pages')

console.log(
  `\n  ${c.cyan}fetched:${c.reset} ${posts.length} posts, ${wpPages.length} pages`
)

// Posts → /blog/...
const postRules = buildRewrites(posts, '/blog', ['/blog'])

const pageRules = buildRewrites(wpPages, '/page', nativeRoutes)

console.log(
  `  ${c.cyan}rules built:${c.reset} ${postRules.length} post rewrites, ${pageRules.length} page rewrites`
)

const outputPath = path.join(
  rootDir,
  `src/configs/${instanceName}/rewrites-legacy.ts`
)

// Serialise rules as a readable TS array with section comments
function serializeRules(rules: RewriteRule[], comment: string): string {
  if (!rules.length) return `  // ${comment}: none`
  const lines = rules.map(
    (r) =>
      `  {\n    source: '${r.source}',\n    destination: '${r.destination}'\n  }`
  )
  return `  // ${comment}\n` + lines.join(',\n')
}

const rulesTs = [
  serializeRules(postRules, 'posts  →  /blog/...'),
  serializeRules(pageRules, 'pages  →  /page/...')
].join(',\n\n')

const fileContent = [
  `// Auto-generated by scripts/generate-legacy-rewrites.ts — do not edit manually.`,
  `// Re-run: npm run generate:legacy-rewrites`,
  `// Generated: ${new Date().toISOString()}`,
  ``,
  `import type { Rewrite } from 'next/dist/lib/load-custom-routes'`,
  ``,
  `const rewrites: Rewrite[] = [`,
  rulesTs,
  `]`,
  ``,
  `const redirects: never[] = []`,
  ``,
  `export default { rewrites, redirects }`,
  ``
].join('\n')

fs.writeFileSync(outputPath, fileContent)

console.log(
  `\n  ${c.green}✓${c.reset} wrote ${path.relative(rootDir, outputPath)}  (${postRules.length + pageRules.length} rules total)\n`
)
