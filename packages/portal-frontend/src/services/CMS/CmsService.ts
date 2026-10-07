/**
 * Orchestrates fetching blog and page content through the active CMS client.
 * Reads env config to pick per-content clients (WordPress/Ghost/Markdown), builds
 * them via createClient, and delegates local-vs-remote routing to CmsResolver.
 * Anatomy: docs → product-guide/cms-content/technical
 */
import { notFound } from 'next/navigation'

import features from '@configs/features'

import { GhostClient, MarkdownClient, WordPressClient } from './clients'
import { CmsResolver } from './CmsResolver'
import {
  type BlogClientConfig,
  type ClientConfig,
  type CmsClient
} from './types'

const wpApiUrl = process.env.WORDPRESS_API_URL || ''
// WordPress API authentication: support both new (user:password) and legacy (direct key) formats
const wpApiUser = process.env.WORDPRESS_API_USER
const wpApiPassword = process.env.WORDPRESS_API_PASSWORD
const wpApiKey =
  wpApiUser && wpApiPassword
    ? `${wpApiUser}:${wpApiPassword}`
    : process.env.WORDPRESS_API_KEY
const wpApplicationName = process.env.WORDPRESS_API_APPLICATION_NAME

const wpRevalidate = process.env.WORDPRESS_REVALIDATE
  ? Number(process.env.WORDPRESS_REVALIDATE)
  : 3600

const ghostApiUrl = process.env.GHOST_API_URL || ''
const ghostApiKey = process.env.GHOST_API_KEY

// Pages client: default to markdown, or use configured client only if it has required URL
const pagesClient =
  process.env.CMS_PAGES_CLIENT === 'wordpress' && wpApiUrl
    ? 'wordpress'
    : process.env.CMS_PAGES_CLIENT === 'ghost' && ghostApiUrl
      ? 'ghost'
      : 'markdown'

// Blog client is only initialized if blog feature is enabled AND CMS_BLOG_CLIENT is set with valid URL
const blogClient =
  features.blog && process.env.CMS_BLOG_CLIENT === 'wordpress' && wpApiUrl
    ? 'wordpress'
    : features.blog && process.env.CMS_BLOG_CLIENT === 'ghost' && ghostApiUrl
      ? 'ghost'
      : undefined

/**
 * Create CMS client based on configuration
 */
function createClient(config: ClientConfig | BlogClientConfig): CmsClient {
  const mdClient = new MarkdownClient()
  const { client, apiUrl, apiKey } = config

  switch (client) {
    case 'markdown':
      return mdClient

    case 'wordpress':
      if (!apiUrl) {
        throw new Error('WordPress apiUrl not provided in configuration.')
      }
      return new WordPressClient(
        apiUrl,
        apiKey,
        mdClient,
        wpApplicationName,
        wpRevalidate
      )

    case 'ghost':
      if (!apiUrl || !apiKey) {
        throw new Error(
          'Ghost apiUrl and apiKey are required in configuration.'
        )
      }
      return new GhostClient(apiUrl, apiKey, mdClient)

    default:
      throw new Error(`Unknown CMS client: ${client}`)
  }
}

// Create Markdown client (always available for local content)
const markdownClient = new MarkdownClient()

// Create remote client (WordPress or Ghost) if configured
const remoteClient: CmsClient | null =
  pagesClient === 'wordpress' && wpApiUrl
    ? new WordPressClient(
        wpApiUrl,
        wpApiKey,
        markdownClient,
        wpApplicationName,
        wpRevalidate
      )
    : pagesClient === 'ghost' && ghostApiUrl && ghostApiKey
      ? new GhostClient(ghostApiUrl, ghostApiKey, markdownClient)
      : null

// Create resolver for page routing
const pageResolver = new CmsResolver(markdownClient, remoteClient)

// Legacy: Create clients (for backward compatibility)
const pagesClientInstance = createClient({
  contentPath: '@content',
  client: pagesClient as ClientConfig['client'],
  apiUrl: pagesClient === 'wordpress' ? wpApiUrl : ghostApiUrl,
  apiKey: pagesClient === 'wordpress' ? wpApiKey : ghostApiKey
})

const blogClientInstance = blogClient
  ? createClient({
      client: blogClient as BlogClientConfig['client'],
      apiUrl: blogClient === 'wordpress' ? wpApiUrl : ghostApiUrl,
      apiKey: blogClient === 'wordpress' ? wpApiKey : ghostApiKey
    })
  : null

// CMS Service singleton
export const CmsService = {
  /**
   * Get page using CmsResolver (respects cms.ts configuration)
   */
  getPage: (slug: string) => pageResolver.getPage(slug),

  /**
   * Get pages client for bulk operations (getPages, getPagePaths, etc.)
   * For single page fetching use getPage() instead
   */
  getPagesClient: () => pagesClientInstance,

  /** Blog routes 404 until the blog feature is on and CMS_BLOG_CLIENT points at a CMS. */
  getBlogClient: () => blogClientInstance ?? notFound()
}

export default CmsService
