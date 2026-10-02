/**
 * Prebuild script: writes the deployment id to deployment-id.generated.json so
 * it is baked into the Heroku slug.
 *
 * The id is the slug commit: Heroku sets SOURCE_VERSION during the build (and
 * HEROKU_SLUG_COMMIT at runtime) to the deployed commit. Off Heroku neither
 * exists, so we fall back to a per-build value. Because the file ships inside
 * the slug, every dyno of one release reads the same id and it changes only
 * when new code is built — which is exactly what the Redis cache namespace
 * needs to stay isolated between deploys. A config var set before the push
 * (the old DEPLOYMENT_ID approach) could not give this guarantee.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const outFile = path.join(dirname, '..', 'deployment-id.generated.json')

const id =
  process.env.SOURCE_VERSION ||
  process.env.HEROKU_SLUG_COMMIT ||
  `local-${Date.now()}`

fs.writeFileSync(outFile, `${JSON.stringify({ id }, null, 2)}\n`)
console.log(`[generate-deployment-id] ${id}`)
