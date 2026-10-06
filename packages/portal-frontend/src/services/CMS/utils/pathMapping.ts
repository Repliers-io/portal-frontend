import routes from '@configs/routes'

import { type Page } from '../types'

export interface PathNode {
  meta?: {
    slug: string
    fullPath: string
  }
  [key: string]: PathNode | { slug: string; fullPath: string } | undefined
}

/**
 * Build slug-to-path mapping from CMS pages
 *
 * @param pages - Array of transformed Page objects
 * @returns Mapping of slug to full path
 *
 * Example:
 * Input: [{ slug: 'buying-a-condo-in-seattle', path: '/guides/buying-a-condo-in-seattle' }]
 * Output: { 'buying-a-condo-in-seattle': '/guides/buying-a-condo-in-seattle' }
 */
export function buildSlugToPathMapping(pages: Page[]): Record<string, string> {
  const slugToPath: Record<string, string> = {}

  pages.forEach((page) => {
    const { slug, path } = page

    if (!slug || !path) return

    // Only add to mapping if path is different from just the slug
    if (path !== `/${slug}`) {
      slugToPath[slug] = path
    }
  })

  return slugToPath
}

/**
 * Build hierarchical path tree from CMS pages
 *
 * @param pages - Array of transformed Page objects
 * @returns Hierarchical tree structure of paths
 *
 * Example:
 * Input: [
 *   { slug: 'buying-a-condo-in-seattle', path: '/guides/buying-a-condo-in-seattle' },
 *   { slug: 'selling', path: '/guides/selling' }
 * ]
 * Output: {
 *   guides: {
 *     'buying-a-condo-in-seattle': { meta: { slug: 'buying-a-condo-in-seattle', fullPath: '/guides/buying-a-condo-in-seattle' } },
 *     'selling': { meta: { slug: 'selling', fullPath: '/guides/selling' } }
 *   }
 * }
 */
export function buildPathTree(pages: Page[]): PathNode {
  const pathTree: PathNode = {}

  pages.forEach((page) => {
    const { slug, path } = page

    if (!slug || !path) return

    // Split path into parts and build tree
    const pathParts = path.split('/').filter(Boolean)
    let currentLevel: PathNode = pathTree

    pathParts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {}
      }

      // On the last part, store slug and full path metadata
      if (index === pathParts.length - 1) {
        const node = currentLevel[part] as PathNode
        node.meta = { slug, fullPath: path }
      }

      currentLevel = currentLevel[part] as PathNode
    })
  })

  return pathTree
}

/**
 * Get page route path with full URL path if available
 *
 * @param page - Page object
 * @returns Full route path
 *
 * Example:
 * - Page with simple slug 'about' -> '/pages/about'
 * - Page with custom path '/guides/buying' -> '/pages/guides/buying'
 */
export function getPagePath(page: Page, useFolderUrl?: boolean): string {
  const { path } = page

  if (useFolderUrl) {
    return path
      ? `${routes.staticPages}${path}`
      : `${routes.staticPages}/${page.slug}`
  }

  if (!path) return `${routes.staticPage}/${page.slug}`

  // If path is just /slug, use simple route
  if (path === `/${page.slug}`) {
    return `${routes.staticPage}/${page.slug}`
  }

  return `${routes.staticPage}${path}`
}
