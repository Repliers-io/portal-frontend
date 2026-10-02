/**
 * Internal types for WordPress client modules
 */

export interface WordPressConfig {
  baseUrl: string
  apiKey?: string
  applicationName?: string
  wordPressComHost: boolean
  revalidate: number
}

export interface FetchOptions {
  endpoint: string
  revalidate?: number
}

/**
 * WordPress REST API menu item response type
 * Based on: https://developer.wordpress.org/rest-api/reference/nav_menu_items/
 */
export interface WordPressMenuItem {
  id: number
  title: { rendered: string } | string
  url: string
  menu_order: number
  parent: number
  target: string
  classes: string[]
  attr_title: string
  description: string
  type: 'taxonomy' | 'post_type' | 'post_type_archive' | 'custom'
  type_label: string
  object: string
  object_id: number
  xfn: string[]
  invalid: boolean
  menus: number
  meta: Record<string, any>
}

export interface WordPressAuthorPayload {
  id: string | number
  slug?: string
  name?: string
  avatar_urls?: Record<string, unknown>
  description?: string
  link?: string
  url?: string
  email?: string
  username?: string
  user_login?: string
  first_name?: string
  last_name?: string
  nickname?: string
  locale?: string
  roles?: string[]
  registered_date?: string
  registered?: string
  acf?: Record<string, unknown>
  meta?: Record<string, unknown>
}

/**
 * WordPress REST API media item (attachment) response type
 */
export interface WpMediaItem {
  id: number
  source_url: string
  alt_text?: string
  media_details?: {
    width?: number
    height?: number
    sizes?: Record<
      string,
      { source_url: string; width?: number; height?: number }
    >
  }
  guid?: { rendered?: string }
}
