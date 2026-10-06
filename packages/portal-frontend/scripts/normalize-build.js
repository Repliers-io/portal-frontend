import path from 'path'
import { fileURLToPath } from 'url'

import { readdir, readFile, rm, writeFile } from 'fs/promises'

import {
  directoryExists,
  findDirsNamed,
  flattenForks,
  stripBlockProperty
} from './normalize-core.js'

// Deploy-time normalization: physically applies the current tenant's component
// forks so plain module resolution finds them (no webpack OverridePlugin), which
// lets the build run on Turbopack. DESTRUCTIVE for the checkout — meant for
// ephemeral build-machine trees, armed only by NORMALIZED_BUILD=true.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const srcRoot = path.join(frontendRoot, 'src')

async function main() {
  if (process.env.NORMALIZED_BUILD !== 'true') {
    console.log('[normalize-build] NORMALIZED_BUILD is not "true" — skipping.')
    return
  }

  const tenant = String(process.env.NEXT_PUBLIC_APP_CONFIGURATION || '').trim()
  if (!tenant) {
    console.error(
      '[normalize-build] NEXT_PUBLIC_APP_CONFIGURATION is not set — cannot normalize.'
    )
    process.exit(1)
  }
  if (!(await directoryExists(path.join(srcRoot, 'configs', tenant)))) {
    console.error(
      `[normalize-build] Unknown tenant '${tenant}': src/configs/${tenant} not found.`
    )
    process.exit(1)
  }

  console.log(`[normalize-build] Normalizing the tree for tenant '${tenant}'…`)

  const overlaid = await flattenForks(srcRoot, [`_${tenant}`])
  console.log(
    `[normalize-build] overlaid ${overlaid} fork entries from _${tenant}/`
  )

  // Phase 2: nothing references foreign tenants' trees anymore — explicit
  // `_<tenant>` specifiers are extinct (enforced by check-fork-imports.js) and
  // tenant-only components are colocated under content/<tenant>/. Deleting the
  // foreign fork dirs and foreign content shrinks the compile surface, keeps
  // other clients' code and branding out of this build, and physically narrows
  // MarkdownClient's deliberately-wide dynamic-import context to
  // {current tenant, defaults} — non-empty by construction, so the empty-context
  // Turbopack failure its runtime-tenant workaround guards against cannot occur.
  const instances = (
    await readdir(path.join(srcRoot, 'configs'), { withFileTypes: true })
  )
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== 'defaults' && name !== tenant)
  let forkDirsRemoved = 0
  for (const name of [...instances.map((i) => `_${i}`), '_opensource']) {
    for (const dir of await findDirsNamed(srcRoot, name)) {
      await rm(dir, { recursive: true, force: true })
      forkDirsRemoved++
    }
  }
  let contentDirsRemoved = 0
  for (const name of instances) {
    const dir = path.join(srcRoot, 'content', name)
    if (await directoryExists(dir)) {
      await rm(dir, { recursive: true, force: true })
      contentDirsRemoved++
    }
  }
  console.log(
    `[normalize-build] removed ${forkDirsRemoved} foreign fork dirs and ${contentDirsRemoved} foreign content dirs`
  )

  const nextConfigPath = path.join(frontendRoot, 'next.config.js')
  let nextConfig = await readFile(nextConfigPath, 'utf-8')
  nextConfig = nextConfig.replace(/^import\s+.*webpack-override.*$/gm, '')
  nextConfig = stripBlockProperty(nextConfig, 'webpack')
  nextConfig = nextConfig.replace(/\n\n\n+/g, '\n\n')
  await writeFile(nextConfigPath, nextConfig)
  console.log(
    '[normalize-build] next.config.js: OverridePlugin import + webpack block removed'
  )

  console.log(
    `[normalize-build] Done — single-resolution tree for '${tenant}'.`
  )
}

main().catch((err) => {
  console.error('[normalize-build] failed:', err)
  process.exit(1)
})
