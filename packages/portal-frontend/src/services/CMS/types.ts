/**
 * CMS Content Types
 */

import { type Metadata } from 'next'
import type React from 'react'

export type ContentType = 'page' | 'post'

export type ContentStatus = 'draft' | 'published' | 'archived'

export interface ContentAuthor {
  id: string
  slug: string
  name: string
  avatar?: string
  coverImage?: string
  bio?: string
  url?: string
  website?: string
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  nickname?: string
  locale?: string
  location?: string
  roles?: string[]
  facebook?: string
  twitter?: string
  metaTitle?: string
  metaDescription?: string
  registeredAt?: Date
  updatedAt?: Date
  agentId?: string
  postCount?: number
  acf?: Record<string, unknown>
  meta?: Record<string, unknown>
  source?: 'wordpress' | 'ghost' | 'markdown'
}

export interface ContentImage {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
  description?: string
  parentSlug?: string // Parent category slug for building paths
  count?: number
  acf?: Record<string, unknown>
  _embedded?: Record<string, unknown[]>
  /** Yoast SEO snippet fields — single-term fetches only (getCategoryBySlug) */
  yoastHead?: { title?: string; description?: string }
}

export interface BlogTag {
  id?: number
  name: string
  slug: string
  count?: number
}

export interface CmsMenuItem {
  id: number
  url: string
  title: string
  order: number
  target?: string
  children?: CmsMenuItem[]
}

export interface BaseContent {
  id: string
  slug: string
  /** Full relative path extracted from the CMS permalink, e.g. /guides/buying-a-condo-in-seattle */
  path?: string
  /** WP parent page ID — used to find children of a folder page */
  parentId?: string
  title: string
  excerpt?: string
  content: string | React.ComponentType // HTML string or MDX component
  contentRaw?: string // Raw content from CMS (without post-processing)
  type: ContentType
  status: ContentStatus
  author?: ContentAuthor
  publishedAt?: Date
  updatedAt?: Date
  featuredImage?: ContentImage
  meta?: Metadata
  tags?: BlogTag[]
  categories?: BlogCategory[]
  acf?: Record<string, unknown> // Advanced Custom Fields data from WordPress
}

/**
 * Layout presets for static pages
 *
 * - 'default': Shows banner and content padding; first child is flush with banner (mt: -4)
 * - 'minimal': No banner and no padding (custom hero section if you need)
 * - 'editorial': No banner, title as H1 inline, no padding (long-form articles)
 * - 'custom': Fully custom-designed pages (movesmartly about/buy/sell/reviews/jobs).
 *   They define their own typography, spacing and background, so CmsContentRenderer
 *   skips its predefined content styles. The shell adds no banner/padding and
 *   stretches content to full height so each page's background reaches the footer.
 */
export type PageLayout = 'default' | 'minimal' | 'editorial' | 'custom'

export interface Page extends BaseContent {
  type: 'page'
  layout?: PageLayout
  /** True when other pages have this page's id as their parent (WP hierarchy) */
  folder?: boolean
}

export interface Post extends BaseContent {
  type: 'post'
  content: string // Blog posts are always HTML/markdown strings from CMS
}

/**
 * CMS Client Interface
 */
export interface CmsClient {
  name: string

  // Pages
  getPage(slug: string): Promise<Page | null>
  getPages(): Promise<Page[]>

  // Posts
  getPost(slug: string): Promise<Post | null>
  getPosts(options?: {
    limit?: number
    offset?: number
    category?: string
    tag?: string
    author?: string | number
  }): Promise<Post[]>

  // Total counts for pagination
  getTotalPosts(options?: { category?: string; tag?: string }): Promise<number>

  // Posts sharing the given post's categories/tags (for "similar posts").
  // Optional: only WordPress implements it; other clients fall back to getPosts.
  getRelatedPosts?(post: Post, options?: { poolSize?: number }): Promise<Post[]>

  // Categories and Tags
  getCategories(): Promise<BlogCategory[]>
  getTags(): Promise<BlogTag[]>
  getCategoryPath(slug: string): Promise<BlogCategory[]>
  getCategoryBySlug(slug: string): Promise<BlogCategory | null>

  // Menus
  getMenu(location: string): Promise<CmsMenuItem[]>
  getMenuBySlug(slug: string): Promise<CmsMenuItem[]>
  getMenuSlugs(): Promise<string[]>

  // Authors
  getAuthor(id: string | number): Promise<ContentAuthor | null>
  getAuthorBySlug(slug: string): Promise<ContentAuthor | null>
  getAuthors(options?: { roles?: string[] }): Promise<ContentAuthor[]>

  // Generate static paths for SSG
  getPagePaths(): Promise<string[]>
  getPostPaths(): Promise<string[]>
}

// Legacy alias for backward compatibility
export type CmsAdapter = CmsClient

/**
 * Single Client Configuration
 */
export interface ClientConfig {
  client: 'markdown' | 'wordpress' | 'ghost'
  apiUrl?: string
  apiKey?: string
  contentPath?: string // For markdown client
}

/**
 * Blog Client Configuration (only external CMS)
 */
export interface BlogClientConfig {
  client: 'wordpress' | 'ghost'
  apiUrl: string
  apiKey?: string
}

// =============================================================================
// CMS Config Types
// =============================================================================

/**
 * CMS Fetch Strategy
 *
 * Defines where to fetch page content from:
 * - 'localOnly': Local markdown only (src/content/)
 * - 'remoteOnly': Remote CMS only (WordPress/Ghost), no fallback
 * - 'remoteFirst': Remote CMS first, fallback to local markdown if not found
 */
export type CmsFetchStrategy = 'localOnly' | 'remoteOnly' | 'remoteFirst'

/**
 * Controls how folder pages (pages that are parents of other pages) appear
 * on the /pages index.
 *
 * - 'foldersFirst'    — show all pages, move folders to top,
 *                        folder URL links to /pages/[slug] (browse view)
 * - 'hideChildren'    — same as above but also hide child pages
 *                        from the flat list
 * - 'hideFolders'     — hide folder pages from the index entirely
 */
export type foldersIndexMode = 'foldersFirst' | 'hideChildren' | 'hideFolders'

/**
 * CMS Routing Config
 *
 * Main configuration for CMS page routing
 */
export interface CmsRoutingConfig {
  /**
   * Page-to-source mapping rules
   *
   * Supports:
   * - Exact match: 'about', 'terms-of-use'
   * - Wildcard patterns: 'blog/*', 'legal/*'
   * - Default fallback: '*'
   *
   * Resolution priority:
   * 1. Exact match (highest)
   * 2. Wildcard patterns (longer patterns first)
   * 3. Default '*' (lowest)
   */
  pages: Record<string, CmsFetchStrategy>

  /**
   * How folder pages (pages that are parents of other pages) appear on /pages index.
   * Defaults to 'foldersFirst' if omitted.
   */
  foldersIndexMode?: foldersIndexMode

  /**
   * Hide pages with no content and folders whose entire subtree has no content.
   * Uses recursive tree traversal. Defaults to false.
   */
  hideEmptyPages?: boolean

  /**
   * Enable debug logging
   * Format: ■ [CMS Route]: slug → strategy → source (fallback)
   */
  debug: boolean
}
