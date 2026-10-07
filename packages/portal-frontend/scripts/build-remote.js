import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { readdir, rm } from 'fs/promises'

// Remote-build entry: with NORMALIZED_BUILD=true the tree is normalized
// (forks flattened, OverridePlugin removed) and built with Turbopack. An export
// ships already normalized, without the OverridePlugin, and builds with
// Turbopack too; otherwise this is exactly the legacy `next build --webpack`.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const normalized = process.env.NORMALIZED_BUILD === 'true'
const turbopack =
  normalized || !existsSync(path.join(__dirname, 'webpack-override.js'))

if (normalized) {
  // A `.next` populated before normalization indexed the pre-flatten tree —
  // Turbopack's incremental state then reports phantom unresolved modules
  // (build caches survive normalize-state changes on Heroku and in reused
  // verification worktrees). Normalized builds always start cold.
  await rm(path.join(__dirname, '..', '.next'), {
    recursive: true,
    force: true
  })
  console.log('[build-remote] cleared .next for a cold normalized build')

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, 'normalize-build.js')],
    { stdio: 'inherit' }
  )
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const args = turbopack
  ? ['exec', 'next', 'build']
  : ['exec', 'next', 'build', '--webpack']
const build = spawnSync('pnpm', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

if (turbopack && build.status === 0) {
  // Turbopack emits a sourcemap for every server chunk with no way to switch
  // them off (experimental.serverSourceMaps only reaches the webpack build) —
  // ~200MB of deploy weight. Webpack builds ship zero server maps, so pruning
  // keeps the deploy at parity; production stack traces are unmapped either way.
  const serverDir = path.join(__dirname, '..', '.next', 'server')
  const maps = (await readdir(serverDir, { recursive: true })).filter((file) =>
    file.endsWith('.map')
  )
  await Promise.all(
    maps.map((file) => rm(path.join(serverDir, file), { force: true }))
  )
  console.log(`[build-remote] pruned ${maps.length} server sourcemaps`)

  // Turbopack's persistent cache (~400MB) ships in the Heroku slug: the frontend
  // .slugignore is never applied (Heroku reads it only from the received source
  // root — the monorepo root; its `src/` entry would break builds if it worked).
  // A normalized build makes it dead weight anyway: it starts with a cold
  // `.next` (see above), so a restored cache is deleted before use.
  await rm(path.join(__dirname, '..', '.next', 'cache'), {
    recursive: true,
    force: true
  })
  console.log('[build-remote] removed .next/cache from the deploy artifact')
}

process.exit(build.status ?? 1)
