import { stat, utimes } from 'node:fs/promises'

const config = new URL('../next.config.js', import.meta.url)
const { atime } = await stat(config)

// Next's config watcher restarts its worker on an mtime change.
await utimes(config, atime, new Date())

process.stdout.write(
  'Requested a reload of the running Next.js dev server. Config contents are unchanged.\n'
)
