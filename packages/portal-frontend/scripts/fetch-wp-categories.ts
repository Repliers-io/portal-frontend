/**
 * Fetches all categories from WordPress and writes a category tree to JSON.
 *
 * Each node in the tree:
 *   { id, name, slug, link, count, description, acf, children[] }
 *
 * Output:
 *   public/<instance>/wp-categories.json
 *
 * Usage:
 *   tsx scripts/fetch-wp-categories.ts            # uses NEXT_PUBLIC_APP_CONFIGURATION from .env
 *   tsx scripts/fetch-wp-categories.ts urbn       # explicit instance
 */

import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// ─── Instance ─────────────────────────────────────────────────────────────────

dotenv.config({ path: path.join(rootDir, '.env'), quiet: true })

const instanceName =
  process.argv[2]?.trim() ||
  String(process.env.NEXT_PUBLIC_APP_CONFIGURATION || '').trim() ||
  'defaults'

const instanceEnvFile = path.join(rootDir, `.env.${instanceName}`)
if (fs.existsSync(instanceEnvFile)) {
  dotenv.config({ path: instanceEnvFile, override: true, quiet: true })
}

// ─── ANSI colours ─────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  grey: '\x1b[90m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

console.log(
  `\n  fetch-wp-categories  ${c.grey}instance:${c.reset} ${instanceName}\n`
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

console.log(`  WordPress  ${c.grey}${wpBaseUrl}${c.reset}`)
console.log(
  `  auth       ${c.grey}${wpApiKey ? (wpApiKey.includes(':') ? 'Basic (user:password)' : 'Bearer token') : 'none (public)'}${c.reset}\n`
)

// ─── HTTP helpers ──────────────────────────────────────────────────────────────

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

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WpCategory {
  id: number
  name: string
  slug: string
  link: string
  count: number
  parent: number
}

interface CategoryNode {
  id: number
  name: string
  slug: string
  link: string
  count: number
  children: CategoryNode[]
}

// ─── Fetch all categories (paginated) ─────────────────────────────────────────

async function fetchAllCategories(): Promise<WpCategory[]> {
  const all: WpCategory[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      context: 'edit',
      _fields: 'id,name,slug,link,count,parent'
    })

    const url = getApiUrl(`/categories?${params}`)

    process.stdout.write(
      `  ${c.grey}categories page ${page}${c.reset}  fetching... `
    )

    const response = await fetch(url, { headers: getHeaders() })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(
        `WordPress API error ${response.status} ${response.statusText}\n  URL: ${url}\n  Body: ${body.slice(0, 200)}`
      )
    }

    const totalPages = response.headers.get('X-WP-TotalPages')
    const total = response.headers.get('X-WP-Total')
    const items: WpCategory[] = await response.json()

    process.stdout.write(
      `${c.green}${items.length} categories${c.reset}` +
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

// ─── Build tree ────────────────────────────────────────────────────────────────

function buildTree(flat: WpCategory[]): CategoryNode[] {
  const nodeMap = new Map<number, CategoryNode>()

  for (const cat of flat) {
    nodeMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      link: cat.link,
      count: cat.count,
      children: []
    })
  }

  const roots: CategoryNode[] = []

  for (const cat of flat) {
    const node = nodeMap.get(cat.id)!
    if (cat.parent === 0) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(cat.parent)
      if (parent) {
        parent.children.push(node)
      } else {
        // Orphan — parent not in results (e.g. hidden/private); treat as root
        roots.push(node)
      }
    }
  }

  // Sort alphabetically at every level for stable output
  const sortNodes = (nodes: CategoryNode[]): void => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => sortNodes(n.children))
  }
  sortNodes(roots)

  return roots
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const flat = await fetchAllCategories()

console.log(`\n  ${c.cyan}fetched:${c.reset} ${flat.length} categories total\n`)

const tree = buildTree(flat)

const rootCount = tree.length
const totalWithChildren = (nodes: CategoryNode[]): number =>
  nodes.reduce((sum, n) => sum + 1 + totalWithChildren(n.children), 0)

console.log(
  `  ${c.cyan}tree:${c.reset} ${rootCount} root nodes, ${totalWithChildren(tree)} total\n`
)

const outputDir = path.join(rootDir, 'public', instanceName)
fs.mkdirSync(outputDir, { recursive: true })

const outputPath = path.join(outputDir, 'wp-categories.json')
fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2))

console.log(
  `  ${c.green}✓${c.reset} wrote ${path.relative(rootDir, outputPath)}\n`
)
