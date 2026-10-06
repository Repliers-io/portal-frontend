import os from 'os'
import path from 'path'

import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'fs/promises'

import {
  flattenForks,
  rewriteForkImports,
  stripBlockProperty
} from './normalize-core.js'

describe('rewriteForkImports', () => {
  const forkDir = path.resolve('/app/src/components/pages/foo/_acme')
  const parent = path.resolve('/app/src/components/pages/foo')
  const file = path.join(forkDir, 'Foo.tsx')

  it('keeps intra-fork specifiers untouched', () => {
    const source = "import { a } from './helpers/a'"
    expect(rewriteForkImports(source, file, forkDir, parent)).toBe(source)
  })

  it('drops one level for specifiers escaping the fork', () => {
    expect(
      rewriteForkImports("import { b } from '../../Bar'", file, forkDir, parent)
    ).toBe("import { b } from '../Bar'")
  })

  it('rewrites require() and dynamic import() forms', () => {
    expect(
      rewriteForkImports(
        "const b = require('../../Bar')",
        file,
        forkDir,
        parent
      )
    ).toBe("const b = require('../Bar')")
    expect(
      rewriteForkImports(
        "const c = await import('../../Bar')",
        file,
        forkDir,
        parent
      )
    ).toBe("const c = await import('../Bar')")
  })

  it('rewrites the bare parent-barrel specifier of a fork-root file', () => {
    expect(
      rewriteForkImports("import { x } from '..'", file, forkDir, parent)
    ).toBe("import { x } from '.'")
  })

  it('keeps bare specifiers that stay inside the fork subtree', () => {
    const deepFile = path.join(forkDir, 'sub', 'Deep.tsx')
    expect(
      rewriteForkImports("import { x } from '..'", deepFile, forkDir, parent)
    ).toBe("import { x } from '..'")
    expect(
      rewriteForkImports("import { y } from '.'", file, forkDir, parent)
    ).toBe("import { y } from '.'")
  })
})

describe('stripBlockProperty', () => {
  it('removes an arrow-function webpack block without eating siblings', () => {
    const config =
      'const nextConfig = {\n  compress: true,\n  webpack: (config, { isServer }) => {\n    config.resolve = {}\n    return config\n  },\n  trailingSlash: false\n}\n'
    const result = stripBlockProperty(config, 'webpack')
    expect(result).not.toContain('webpack:')
    expect(result).toContain('compress: true')
    expect(result).toContain('trailingSlash: false')
  })
})

describe('flattenForks', () => {
  it('overlays fork files over the parent, rewrites imports, removes the fork dir', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'flatten-'))
    const comp = path.join(root, 'components', 'Card')
    await mkdir(path.join(comp, '_acme'), { recursive: true })
    await writeFile(
      path.join(comp, 'Card.tsx'),
      'export const source = "default"\n'
    )
    await writeFile(
      path.join(comp, '_acme', 'Card.tsx'),
      "import { util } from '../../util'\nexport const source = 'fork'\n"
    )

    const overlaid = await flattenForks(root, ['_acme'])

    expect(overlaid).toBe(1)
    const flattened = await readFile(path.join(comp, 'Card.tsx'), 'utf-8')
    expect(flattened).toContain("from '../util'")
    expect(flattened).toContain("source = 'fork'")
    // Union-merge: the default counterpart survives as `.__default` and the
    // fork re-exports it (explicit fork exports shadow the star re-export).
    expect(flattened).toContain("export * from './Card.__default'")
    const preserved = await readFile(
      path.join(comp, 'Card.__default.tsx'),
      'utf-8'
    )
    expect(preserved).toContain('source = "default"')
    expect((await readdir(comp)).sort()).toEqual([
      'Card.__default.tsx',
      'Card.tsx'
    ])
    await rm(root, { recursive: true, force: true })
  })

  it('union-merges a colliding barrel: fork exports win, default-only exports survive', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'flatten-barrel-'))
    const comp = path.join(root, 'components')
    await mkdir(path.join(comp, '_acme'), { recursive: true })
    await writeFile(
      path.join(comp, 'index.ts'),
      "export { DefaultOnly } from './DefaultOnly'\n"
    )
    await writeFile(
      path.join(comp, '_acme', 'index.ts'),
      "export { ForkThing } from './ForkThing'\n"
    )

    await flattenForks(root, ['_acme'])

    const barrel = await readFile(path.join(comp, 'index.ts'), 'utf-8')
    expect(barrel).toContain("export { ForkThing } from './ForkThing'")
    expect(barrel).toContain("export * from './index.__default'")
    const preserved = await readFile(
      path.join(comp, 'index.__default.ts'),
      'utf-8'
    )
    expect(preserved).toContain('DefaultOnly')
    await rm(root, { recursive: true, force: true })
  })

  it('merges a directory-type fork entry, preserving default-only siblings', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'flatten-dir-'))
    const componentsDir = path.join(root, 'Card', 'components')
    const forkComponentsDir = path.join(root, 'Card', '_acme', 'components')
    await mkdir(componentsDir, { recursive: true })
    await mkdir(forkComponentsDir, { recursive: true })
    await writeFile(
      path.join(componentsDir, 'Kept.tsx'),
      'export const source = "default-kept"\n'
    )
    await writeFile(
      path.join(componentsDir, 'Replaced.tsx'),
      'export const source = "default-replaced"\n'
    )
    await writeFile(
      path.join(forkComponentsDir, 'Replaced.tsx'),
      'export const source = "fork"\n'
    )

    await flattenForks(root, ['_acme'])

    const kept = await readFile(path.join(componentsDir, 'Kept.tsx'), 'utf-8')
    expect(kept).toContain('default-kept')
    const replaced = await readFile(
      path.join(componentsDir, 'Replaced.tsx'),
      'utf-8'
    )
    expect(replaced).toContain('source = "fork"')
    expect(replaced).toContain("export * from './Replaced.__default'")
    await rm(root, { recursive: true, force: true })
  })
})
