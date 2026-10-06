import path from 'path'
import { fileURLToPath } from 'url'

import { readdir, readFile } from 'fs/promises'

// CI guard: no import specifier may contain a `_<tenant>` path segment.
// Exists as a standalone script because ESLint does not parse .mdx — the
// class-B hits that broke every tenant's flattened build live in MDX content.
// Default = warning (prints hits, exit 0); `--error` flips to exit 1.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcRoot = path.resolve(__dirname, '..', 'src')
const checkedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx'])

const instances = (
  await readdir(path.join(srcRoot, 'configs'), { withFileTypes: true })
)
  .filter((entry) => entry.isDirectory() && entry.name !== 'defaults')
  .map((entry) => `_${entry.name}`)

const specifierRe =
  /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*|\bjest\.mock\(\s*)['"]([^'"]+)['"]/g

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

let violations = 0
for await (const file of walk(srcRoot)) {
  if (!checkedExtensions.has(path.extname(file))) continue
  const lines = (await readFile(file, 'utf-8')).split('\n')
  lines.forEach((line, index) => {
    for (const match of line.matchAll(specifierRe)) {
      if (match[1].split('/').some((part) => instances.includes(part))) {
        violations++
        console.log(`${path.relative(srcRoot, file)}:${index + 1}  ${match[1]}`)
      }
    }
  })
}

if (violations === 0) {
  console.log('[check-fork-imports] clean')
} else {
  console.log(`[check-fork-imports] ${violations} fork-naming specifier(s)`)
  if (process.argv.includes('--error')) process.exit(1)
}
