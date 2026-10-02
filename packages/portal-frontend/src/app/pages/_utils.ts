import cmsRoutingConfig from '@configs/cms'

import { type Page } from 'services/CMS'

/**
 * Filter pages to show direct children of the folder at the given path.
 * Finds the folder by path, then returns pages with matching parentId.
 * Falls back to URL-prefix matching for CMS clients without parentId (Ghost).
 */
export function filterPagesByPath(
  pages: Page[],
  pathSegments: string[]
): Page[] {
  const pathPrefix = '/' + pathSegments.join('/')
  const folder = pages.find((p) => p.path === pathPrefix)

  if (folder) {
    return pages.filter((p) => p.parentId === folder.id)
  }

  // Fallback (Ghost / CMS without parentId): match by URL prefix
  return pages.filter((p) => p.path?.startsWith(pathPrefix + '/'))
}

function hasContent(page: Page): boolean {
  if (typeof page.content === 'function') return true
  return typeof page.content === 'string' && page.content.trim().length > 0
}

function hasVisibleDescendant(page: Page, allPages: Page[]): boolean {
  const children = allPages.filter((p) => p.parentId === page.id)
  return children.some(
    (child) => hasContent(child) || hasVisibleDescendant(child, allPages)
  )
}

export function applyHideEmptyPages(pages: Page[], allPages: Page[]): Page[] {
  if (!cmsRoutingConfig.hideEmptyPages) return pages
  return pages.filter((p) => hasContent(p) || hasVisibleDescendant(p, allPages))
}
