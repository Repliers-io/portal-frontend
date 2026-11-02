import fs from 'fs'
import path from 'path'

import content from '@configs/content'

// Static Nextra exports that `build:docs` assembles under public/documentation,
// one folder per site; absent when the build ships without the documentation.
const documentationDir = path.join(process.cwd(), 'public', 'documentation')

export const documentationSites = () =>
  fs.existsSync(documentationDir)
    ? fs
        .readdirSync(documentationDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : []

// Every exported page is a folder holding an index.html; `_`-prefixed folders are
// Next/pagefind internals and 404 is the not-found page. Routes carry no trailing
// slash: the portal redirects `/documentation/<site>/<page>/` to the bare path.
const pageRoutes = (dir: string, route = ''): string[] => [
  ...(fs.existsSync(path.join(dir, 'index.html')) ? [route] : []),
  ...fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith('_') &&
        entry.name !== '404'
    )
    .flatMap((entry) =>
      pageRoutes(path.join(dir, entry.name), `${route}/${entry.name}`)
    )
]

export const documentationPages = (site: string) =>
  pageRoutes(path.join(documentationDir, site)).sort()

// A tenant kept out of the index that ships the documentation exposes only the
// documentation to crawlers (robots.txt) and in its sitemap index.
export const documentationOnly = () =>
  content.noIndex && documentationSites().length > 0
