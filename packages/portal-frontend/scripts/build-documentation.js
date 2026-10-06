import { spawnSync } from 'child_process'
import { cpSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Builds both Nextra sites as static exports and assembles them under
// public/documentation, served by the rewrites generate-rewrites.ts emits while
// that folder exists. Monorepo-only: the docs packages are siblings of this one.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packagesDir = path.join(__dirname, '..', '..')
const target = path.join(__dirname, '..', 'public', 'documentation')

const sites = [
  { pkg: 'docs', dir: 'frontend' },
  { pkg: 'backend-docs', dir: 'backend' }
]

for (const { pkg, dir } of sites) {
  const build = spawnSync(`pnpm --filter ${pkg} run build:static`, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, DOCS_BASE_PATH: `/documentation/${dir}` }
  })
  if (build.status !== 0) process.exit(build.status ?? 1)
  cpSync(path.join(packagesDir, pkg, 'out'), path.join(target, dir), {
    recursive: true
  })
}

cpSync(
  path.join(__dirname, 'documentation-index.html'),
  path.join(target, 'index.html')
)
