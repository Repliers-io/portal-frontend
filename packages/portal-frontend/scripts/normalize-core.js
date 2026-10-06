import path from 'path'

import {
  cp,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile
} from 'fs/promises'

// Fork flattening + next.config transform helpers, shared by the deploy-time
// normalization (normalize-build.js) and the OSS export (scripts/oss-shared.ts
// re-exports from here). Plain ESM on purpose: build machines run this with
// bare node, no tsx.

const componentExtensions = ['.tsx', '.ts', '.jsx', '.js']
const sourceExtensions = new Set(['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs'])

/** Collect every directory (absolute path) whose base name equals `name`, under `root`. */
export async function findDirsNamed(root, name) {
  const found = []
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const full = path.join(dir, entry.name)
      if (entry.name === name) found.push(full)
      else await walk(full)
    }
  }
  await walk(root)
  return found
}

/** Every file (absolute path) under `dir`, recursively. */
async function listFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await listFiles(full)))
    else out.push(full)
  }
  return out
}

/**
 * Rewrite relative import/export specifiers in a fork source file that is being
 * moved up one level (the `_<tenant>` segment is dropped).
 *
 * Fork files are authored relative to their `_<tenant>/` location, so a specifier
 * that climbs OUT of the fork subtree (into the real tree) carries one extra `..`.
 * Specifiers that stay INSIDE the fork subtree keep their relative position (both
 * the file and the target move together), so they are left untouched.
 *
 * @param {string} content - Source text of the fork file.
 * @param {string} oldFile - Absolute path of the file inside the fork dir.
 * @param {string} forkDir - Absolute path of the `_<tenant>` fork root.
 * @param {string} parent - Absolute path of the fork's parent (the flatten target dir).
 */
export function rewriteForkImports(content, oldFile, forkDir, parent) {
  const oldDir = path.dirname(oldFile)
  const newDir = path.dirname(
    path.join(parent, path.relative(forkDir, oldFile))
  )
  const forkPrefix = forkDir + path.sep

  const remap = (spec) => {
    const target = path.resolve(oldDir, spec)
    // Target stays inside the fork subtree → relative position is preserved.
    if (target === forkDir || target.startsWith(forkPrefix)) return spec
    // Target is in the real tree → recompute from the file's new (shallower) location.
    let rel = path.relative(newDir, target).split(path.sep).join('/')
    // The moved file now sits IN the target dir — '..' from a fork-root file
    // becomes the same-dir barrel.
    if (rel === '') return '.'
    if (!rel.startsWith('.')) rel = './' + rel
    return rel
  }

  // `from '...'`, `import '...'`, `import('...')`, `require('...')` with a relative
  // specifier — either a path form (`./x`, `../x`) or a BARE `.`/`..` (a barrel
  // import with no slash; skipping those silently retargets the parent barrel to
  // the grandparent after the move).
  const patterns = [
    /(\bfrom\s*['"])(\.\.?\/[^'"]*|\.\.?)(['"])/g,
    /(\bimport\s*['"])(\.\.?\/[^'"]*|\.\.?)(['"])/g,
    /(\bimport\s*\(\s*['"])(\.\.?\/[^'"]*|\.\.?)(['"])/g,
    /(\brequire\s*\(\s*['"])(\.\.?\/[^'"]*|\.\.?)(['"])/g
  ]
  for (const re of patterns) {
    content = content.replace(
      re,
      (_m, pre, spec, post) => pre + remap(spec) + post
    )
  }
  return content
}

/**
 * Physically apply component overrides that the webpack `OverridePlugin` resolves
 * at runtime. For each override directory (e.g. `_opensource`, `_<tenant>`) it
 * overlays every entry onto the parent directory, first removing any competing
 * parent artifact of the same base name (file OR directory) so the fork wins in
 * default module resolution and no dead leftover remains. Moved source files get
 * their relative imports rewritten (fork files live one level deeper). The
 * override directory is deleted afterwards.
 *
 * Override names are applied in the given order (later overrides win on collision).
 * After the pass, no override directory of any listed name remains under `root`.
 *
 * @param {string} root
 * @param {string[]} overrideDirNames
 * @returns {Promise<number>} count of overlaid fork entries
 */
/**
 * If `target` collides with an existing same-base default source module,
 * preserve that default as `<base>.__default.<ext>` and return the
 * extensionless specifier to re-export it from; null when no counterpart
 * exists. `.__default` files themselves are never counterparts, keeping
 * repeated overlays (e.g. `_opensource` then `_<tenant>`) well-defined.
 */
async function keepDefaultCounterpart(target) {
  const dir = path.dirname(target)
  const base = path.basename(target).replace(/\.(tsx|ts|jsx|js)$/, '')
  if (base.endsWith('.__default')) return null
  for (const ext of componentExtensions) {
    const candidate = path.join(dir, base + ext)
    try {
      if (!(await stat(candidate)).isFile()) continue
    } catch {
      continue
    }
    const kept = `${base}.__default`
    await rename(candidate, path.join(dir, kept + ext))
    return kept
  }
  return null
}

export async function flattenForks(root, overrideDirNames) {
  let overlaid = 0

  for (const name of overrideDirNames) {
    const forkDirs = await findDirsNamed(root, name)
    // Deepest first, so a fork nested inside another fork's subtree is applied before the outer copy/removal.
    forkDirs.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length)

    for (const forkDir of forkDirs) {
      const parent = path.dirname(forkDir)

      // A fork FILE entry may replace a same-named default DIRECTORY outright.
      // DIRECTORY entries merge into the existing default directory instead
      // (deleting it wholesale dropped default-only files under it, e.g.
      // ListingMainContent/components/). A deeper collision — a fork FILE at
      // `sub/X.tsx` when the default already has a directory `sub/X/` — is not
      // handled; no such case exists in the tree.
      for (const entry of await readdir(forkDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          const base = entry.name.replace(/\.(tsx|ts|jsx|js)$/, '')
          await rm(path.join(parent, base), { recursive: true, force: true })
        }
      }

      // Move every fork file up one level. Source files get their relative
      // imports rewritten; a fork source file colliding with a same-base
      // default module UNION-merges instead of replacing it — the default is
      // kept as `<base>.__default.<ext>` and the fork re-exports it via a
      // trailing `export *`. Explicit fork exports shadow star re-exports
      // (ESM), so fork symbols win while default-only symbols survive. This
      // mirrors the webpack OverridePlugin reality: barrel requests always
      // resolve to the DEFAULT index (the plugin only overrides extensionless
      // component requests via `_<env>/<name>.tsx` / `_<env>/<name>/index.ts`),
      // so post-flatten the parent module must serve BOTH the fork's surface
      // (for former explicit `_<tenant>` importers) and the default's (for
      // surviving default siblings).
      for (const file of await listFiles(forkDir)) {
        const target = path.join(parent, path.relative(forkDir, file))
        await mkdir(path.dirname(target), { recursive: true })
        if (sourceExtensions.has(path.extname(file))) {
          let content = rewriteForkImports(
            await readFile(file, 'utf-8'),
            file,
            forkDir,
            parent
          )
          const kept = await keepDefaultCounterpart(target)
          if (kept) content += `\nexport * from './${kept}'\n`
          await writeFile(target, content)
        } else {
          await cp(file, target)
        }
        overlaid++
      }

      await rm(forkDir, { recursive: true, force: true })
    }
  }

  return overlaid
}

/**
 * Find the index of the '}' that closes the block opened at `openIndex`.
 * Honors string literals and comments so braces inside them are not counted.
 * @returns {number} index of the matching '}', or -1 if unbalanced.
 */
export function matchBrace(source, openIndex) {
  let depth = 0

  for (let i = openIndex; i < source.length; i++) {
    const char = source[i]

    if (char === '"' || char === "'" || char === '`') {
      const quote = char
      i++
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++
        i++
      }
      continue
    }
    if (char === '/' && source[i + 1] === '/') {
      i += 2
      while (i < source.length && source[i] !== '\n') i++
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/'))
        i++
      i++
      continue
    }

    if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) return i
    }
  }

  return -1
}

/**
 * Remove a top-level config property whose value is an arrow function
 * (`key: (args) => { ... }`) or a plain object (`key: { ... }`), using brace
 * matching so nested braces do not truncate the removal.
 * @returns {string} content without that property, or unchanged if not found.
 */
export function stripBlockProperty(content, key) {
  const arrowHead = new RegExp(
    `\\n[ \\t]*${key}\\s*:\\s*(?:\\([^)]*\\)|[A-Za-z_$][\\w$]*)\\s*=>\\s*\\{`
  )
  const objectHead = new RegExp(`\\n[ \\t]*${key}\\s*:\\s*\\{`)

  const match = content.match(arrowHead) || content.match(objectHead)
  if (match?.index === undefined) return content

  const removeStart = match.index
  const bodyOpenIndex = match.index + match[0].length - 1
  const bodyCloseIndex = matchBrace(content, bodyOpenIndex)
  if (bodyCloseIndex === -1) return content

  let end = bodyCloseIndex + 1
  if (content[end] === ',') end++

  return content.slice(0, removeStart) + content.slice(end)
}

/** Whether a path exists and is a directory. */
export async function directoryExists(dir) {
  try {
    return (await stat(dir)).isDirectory()
  } catch {
    return false
  }
}
