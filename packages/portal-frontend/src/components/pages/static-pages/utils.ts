import { type foldersIndexMode, type Page } from 'services/CMS'

export function applyMode(pages: Page[], mode: foldersIndexMode): Page[] {
  if (mode === 'hideFolders') {
    return pages.filter((p) => !p.folder)
  }

  if (mode === 'hideChildren') {
    const folderSlugs = new Set(
      pages.filter((p) => p.folder).map((p) => p.slug)
    )
    return pages.filter(
      (p) => p.folder || !folderSlugs.has(p.slug.split('/')[0])
    )
  }

  return pages
}
