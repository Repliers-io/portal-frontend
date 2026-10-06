import queryString from 'query-string'

import { logError } from 'utils/log'

import { transformMenuItem } from '../../transformers/wordpress'
import { type CmsMenuItem } from '../../types'

import { type WordPressConfig, type WordPressMenuItem } from './types'
import { wpFetch } from './utils'

/**
 * WordPress Menus API methods
 */
export class MenusService {
  constructor(private config: WordPressConfig) {}

  /**
   * Get menu items by location
   *
   * Common WordPress menu locations:
   * - 'primary' - Main navigation menu
   * - 'footer' - Footer menu
   * - 'social' - Social media links
   * - 'sidebar' - Sidebar navigation
   *
   * Check your WordPress theme settings (Appearance → Menus) for available locations
   *
   * Note: Requires WordPress 6.8+ and the rest_menu_read_access filter enabled
   * Add to functions.php: add_filter('rest_menu_read_access', '__return_true');
   *
   * @param location - WordPress menu location slug
   */
  async getMenu(location: string): Promise<CmsMenuItem[]> {
    try {
      // Fetch menu location data (WordPress 6.8+)
      const { data: menuLocation } = await wpFetch(
        this.config,
        `/menu-locations/${encodeURIComponent(location)}`
      )

      if (!menuLocation || !menuLocation.menu) return []

      const menuId = menuLocation.menu

      // Fetch all menu items with pagination support
      // According to WordPress REST API documentation:
      // https://developer.wordpress.org/rest-api/reference/nav_menu_items/
      // Menu items endpoint: /wp/v2/menu-items
      let page = 1
      let totalPages = 1
      let menuItems: WordPressMenuItem[] = []
      const perPage = 100

      do {
        const query = queryString.stringify({
          page,
          menus: menuId,
          per_page: perPage,
          orderby: 'menu_order',
          order: 'asc'
        })
        const { data, headers } = await wpFetch(
          this.config,
          `/menu-items?${query}`
        )

        menuItems = menuItems.concat(data)

        // Get total pages from headers
        const totalPagesHeader = headers.get('X-WP-TotalPages')
        totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1

        page++
      } while (page <= totalPages)

      if (!menuItems.length) return []

      // Transform WordPress API response to MenuItem
      const transformedItems = menuItems.map((item) => ({
        ...transformMenuItem(item, this.config.baseUrl),
        parent: item.parent
      }))

      // Build tree structure
      const buildTree = (
        items: (CmsMenuItem & { parent: number })[],
        parentId: number = 0
      ): CmsMenuItem[] => {
        return items
          .filter((item) => item.parent === parentId)
          .sort((a, b) => a.order - b.order)
          .map(({ parent: _, ...item }) => ({
            ...item,
            children: buildTree(items, item.id)
          }))
      }

      const tree = buildTree(transformedItems)

      return tree
    } catch (error) {
      logError(`[getMenu] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get menu items by menu ID
   *
   * @param menuId - WordPress menu ID
   */
  async getMenuById(menuId: number): Promise<CmsMenuItem[]> {
    try {
      let page = 1
      let totalPages = 1
      let menuItems: WordPressMenuItem[] = []
      const perPage = 100

      do {
        const query = queryString.stringify({
          page,
          menus: menuId,
          per_page: perPage,
          orderby: 'menu_order',
          order: 'asc'
        })
        const { data, headers } = await wpFetch(
          this.config,
          `/menu-items?${query}`
        )

        menuItems = menuItems.concat(data)

        const totalPagesHeader = headers.get('X-WP-TotalPages')
        totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1

        page++
      } while (page <= totalPages)

      if (!menuItems.length) return []

      // Transform WordPress API response to MenuItem
      const transformedItems = menuItems.map((item) => ({
        ...transformMenuItem(item, this.config.baseUrl),
        parent: item.parent
      }))

      // Build tree structure
      const buildTree = (
        items: (CmsMenuItem & { parent: number })[],
        parentId: number = 0
      ): CmsMenuItem[] => {
        return items
          .filter((item) => item.parent === parentId)
          .sort((a, b) => a.order - b.order)
          .map(({ parent: _, ...item }) => ({
            ...item,
            children: buildTree(items, item.id)
          }))
      }

      const tree = buildTree(transformedItems)

      return tree
    } catch (error) {
      logError(`[getMenuById] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get menu items by menu slug
   *
   * @param slug - WordPress menu slug
   */
  async getMenuBySlug(slug: string): Promise<CmsMenuItem[]> {
    try {
      // First get menu details by slug
      const { data: menus } = await wpFetch(
        this.config,
        `/menus?slug=${encodeURIComponent(slug)}`
      )

      if (!menus || menus.length === 0) return []

      const menuId = menus[0].id
      return this.getMenuById(menuId)
    } catch (error) {
      logError(`[getMenuBySlug] ${(error as Error).message}`)
      return []
    }
  }

  /**
   * Get all available menu slugs
   *
   * @returns Array of menu slugs available in WordPress
   */
  async getMenuSlugs(): Promise<string[]> {
    try {
      let page = 1
      let totalPages = 1
      let allMenus: any[] = []
      const perPage = 100

      do {
        const query = queryString.stringify({
          page,
          per_page: perPage
        })
        const { data, headers } = await wpFetch(this.config, `/menus?${query}`)

        allMenus = allMenus.concat(data)

        const totalPagesHeader = headers.get('X-WP-TotalPages')
        totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1

        page++
      } while (page <= totalPages)

      return allMenus.map((menu) => menu.slug).filter(Boolean)
    } catch (error) {
      logError(`[getMenuSlugs] ${(error as Error).message}`)
      return []
    }
  }
}
