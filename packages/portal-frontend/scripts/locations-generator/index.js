/**
 * Locations tree generator wrapper.
 *
 * Usage:
 *   node scripts/generate-locations-tree.mjs [instance]
 *   node scripts/generate-locations-tree.mjs urbn
 *   node scripts/generate-locations-tree.mjs urbn --api-url=https://api.example.com
 *   node scripts/generate-locations-tree.mjs          # uses NEXT_PUBLIC_APP_CONFIGURATION from .env
 *
 * Regenerates tsconfig.json for the target instance (so @configs/* resolves correctly),
 * then runs the entry script via tsx.
 */

import { execFileSync, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

// -- 1. Parse CLI arguments ----------------------------------------------------

const positionalArgs = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const flagArgs = process.argv.slice(2).filter((a) => a.startsWith('--'))

const apiUrlFlag = flagArgs
  .find((a) => a.startsWith('--api-url='))
  ?.split('=')
  .slice(1)
  .join('=')

// -- 2. Determine instance ----------------------------------------------------

// positional arg wins; fall back to env var; fall back to reading .env file
let instance = positionalArgs[0] || process.env.NEXT_PUBLIC_APP_CONFIGURATION

if (!instance) {
  const envFile = path.join(root, '.env')
  if (fs.existsSync(envFile)) {
    const match = fs
      .readFileSync(envFile, 'utf8')
      .split('\n')
      .find((l) => l.startsWith('NEXT_PUBLIC_APP_CONFIGURATION='))
    if (match) instance = match.split('=')[1].trim()
  }
}

instance = instance || 'defaults'

if (apiUrlFlag) {
  console.log(`[generate-locations] using custom API URL: ${apiUrlFlag}`)
}

// -- 3. Regenerate tsconfig.json for this instance (silent) ------------------

execFileSync(
  process.execPath,
  [path.join(root, 'scripts/generate-tsconfig.js')],
  {
    cwd: root,
    stdio: 'ignore',
    env: { ...process.env, NEXT_PUBLIC_APP_CONFIGURATION: instance }
  }
)

// -- 4. Find the right .env file ---------------------------------------------

const envFileCandidates = [
  instance !== 'defaults' ? path.join(root, `.env.${instance}`) : null,
  path.join(root, '.env')
].filter(Boolean)

const envFileArg = envFileCandidates.find((f) => fs.existsSync(f))

// -- 5. Run the entry script via tsx -----------------------------------------

const nodeArgs = [
  ...(envFileArg ? [`--env-file=${envFileArg}`] : []),
  '--import',
  'tsx/esm',
  '--import',
  pathToFileURL(path.join(__dirname, 'register-asset-stub.js')).href,
  path.join(__dirname, 'entry.ts')
]

const result = spawnSync(process.execPath, nodeArgs, {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_CONFIGURATION: instance,
    ...(apiUrlFlag ? { NEXT_PUBLIC_API_URL: apiUrlFlag } : {})
  }
})

process.exit(result.status ?? 1)
