import fs from 'fs/promises'
import path from 'path'
import fg from 'fast-glob'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import { fileURLToPath } from 'url'

const SOURCE_GLOB = 'src/**/*.{js,jsx,ts,tsx}'
const OUTPUT_FILE = 'src/i18n/extracted.json'
const EXISTING_TRANSLATIONS_FILE = 'src/i18n/defaults/en.json'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  orange: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.dirname(__dirname) // Go up one level from scripts to project root
const files = await fg(SOURCE_GLOB, { cwd: projectRoot, absolute: true })

const keys = new Set()

/**
 * key: fullKey like "auth.login.title"
 * returns: { auth: { login: { title: '' } } }
 */
function expandKey(key) {
  return key.split('.').reduceRight((acc, cur) => ({ [cur]: acc }), '')
}

function deepMerge(target, source) {
  for (const key in source) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] || {}, source[key])
    } else {
      target[key] = ''
    }
  }
  return target
}

function flattenObject(obj, prefix = '') {
  const flattened = new Map() // Using Map to store keys along with their values

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      const nested = flattenObject(obj[key], fullKey)
      nested.forEach((value, k) => flattened.set(k, value))
    } else {
      flattened.set(fullKey, obj[key])
    }
  }

  return flattened
}

function mergeTranslations(existing, extracted) {
  const result = JSON.parse(JSON.stringify(existing)) // Deep clone

  function mergeRecursive(target, source) {
    for (const key in source) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {}
        }
        mergeRecursive(target[key], source[key])
      } else if (!(key in target)) {
        target[key] = source[key]
      }
    }
  }

  mergeRecursive(result, extracted)
  return result
}

// First pass: collect namespaces from translation function calls
console.log(
  colorize(
    `First pass: analyzing ${files.length} files for namespaces...`,
    'cyan'
  )
)
const detectedNamespaces = new Set()

for (const file of files) {
  const code = await fs.readFile(file, 'utf-8')

  let ast
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    })
  } catch (err) {
    continue
  }

  const translationVars = new Map() // varName -> namespace (or null for global)

  traverse.default(ast, {
    VariableDeclarator(path) {
      const init = path.get('init')
      const id = path.get('id')

      if (id.isIdentifier()) {
        let namespace = null

        // Handle useTranslations('namespace')
        if (
          init.isCallExpression() &&
          init.get('callee').isIdentifier({ name: 'useTranslations' })
        ) {
          const args = init.get('arguments')
          const nsArg = args[0]
          namespace = nsArg?.isStringLiteral() ? nsArg.node.value : null
          translationVars.set(id.node.name, namespace)

          if (namespace) {
            detectedNamespaces.add(namespace)
          }
        }

        // Handle getTranslations('namespace')
        if (
          init.isCallExpression() &&
          init.get('callee').isIdentifier({ name: 'getTranslations' })
        ) {
          const args = init.get('arguments')
          const nsArg = args[0]
          namespace = nsArg?.isStringLiteral() ? nsArg.node.value : null
          translationVars.set(id.node.name, namespace)

          if (namespace) {
            detectedNamespaces.add(namespace)
          }
        }

        // Handle await getTranslations('namespace')
        if (
          init.isAwaitExpression() &&
          init.get('argument').isCallExpression() &&
          init
            .get('argument')
            .get('callee')
            .isIdentifier({ name: 'getTranslations' })
        ) {
          const args = init.get('argument').get('arguments')
          const nsArg = args[0]
          namespace = nsArg?.isStringLiteral() ? nsArg.node.value : null
          translationVars.set(id.node.name, namespace)

          if (namespace) {
            detectedNamespaces.add(namespace)
          }
        }
      }
    },

    // Analyze t() calls to extract namespaces from keys
    CallExpression(path) {
      const callee = path.get('callee')

      // Handle t('namespace.key') where t comes from useTranslations() with no argument
      if (callee.isIdentifier() && translationVars.has(callee.node.name)) {
        const tVar = callee.node.name
        const namespace = translationVars.get(tVar)
        const arg = path.node.arguments[0]

        // If t was created without a namespace, extract the namespace from the key
          if (namespace === null && arg?.type === 'StringLiteral') {
          const key = arg.value
          const firstDotIndex = key.indexOf('.')
          if (firstDotIndex > 0) {
            const extractedNamespace = key.substring(0, firstDotIndex)
            detectedNamespaces.add(extractedNamespace)
          }
        }
      }

      // Handle obj.t('namespace.key')
      if (
        callee.isMemberExpression() &&
        callee.get('property').isIdentifier({ name: 't' })
      ) {
        const obj = callee.get('object')
        if (obj.isIdentifier() && translationVars.has(obj.node.name)) {
          const namespace = translationVars.get(obj.node.name)
          const arg = path.node.arguments[0]

          // If t was created without a namespace, extract the namespace from the key
          if (namespace === null && arg?.type === 'StringLiteral') {
            const key = arg.value
            const firstDotIndex = key.indexOf('.')
            if (firstDotIndex > 0) {
              const extractedNamespace = key.substring(0, firstDotIndex)
              detectedNamespaces.add(extractedNamespace)
            }
          }
        }
      }
    },

    // Handle <Trans id="namespace.key" />
    JSXOpeningElement(path) {
      const name = path.get('name')
      if (name.isJSXIdentifier({ name: 'Trans' })) {
        const idAttr = path
          .get('attributes')
          .find((attr) => attr.get('name').isJSXIdentifier({ name: 'id' }))
        if (idAttr) {
          const val = idAttr.get('value')
          if (val.isStringLiteral()) {
            const key = val.node.value
            const firstDotIndex = key.indexOf('.')
            if (firstDotIndex > 0) {
              const extractedNamespace = key.substring(0, firstDotIndex)
              detectedNamespaces.add(extractedNamespace)
            }
          }
        }
      }
    }
  })
}

console.log(
  colorize(
    `Detected namespaces: ${Array.from(detectedNamespaces).sort().join(', ')}`,
    'blue'
  )
)

// Second pass: extract keys taking detected namespaces into account
console.log(colorize(`Second pass: extracting translation keys...`, 'cyan'))

for (const file of files) {
  const code = await fs.readFile(file, 'utf-8')

  let ast
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    })
  } catch (err) {
    console.warn(
      colorize(`Failed to parse ${path.basename(file)}: ${err.message}`, 'red')
    )
    continue
  }

  const translationVars = new Map() // varName -> namespace (or null for global)

  traverse.default(ast, {
    // Match: const t = useTranslations('namespace') or const t = await getTranslations('namespace')
    VariableDeclarator(path) {
      const init = path.get('init')
      const id = path.get('id')

      if (id.isIdentifier()) {
        // Handle useTranslations('namespace')
        if (
          init.isCallExpression() &&
          init.get('callee').isIdentifier({ name: 'useTranslations' })
        ) {
          const args = init.get('arguments')
          const nsArg = args[0]
          const namespace = nsArg?.isStringLiteral() ? nsArg.node.value : null
          translationVars.set(id.node.name, namespace)
        }

        // Handle await getTranslations('namespace')
        if (
          init.isAwaitExpression() &&
          init.get('argument').isCallExpression() &&
          init
            .get('argument')
            .get('callee')
            .isIdentifier({ name: 'getTranslations' })
        ) {
          const args = init.get('argument').get('arguments')
          const nsArg = args[0]
          const namespace = nsArg?.isStringLiteral() ? nsArg.node.value : null
          translationVars.set(id.node.name, namespace)
        }

        // Handle getTranslations('namespace') without await
        if (
          init.isCallExpression() &&
          init.get('callee').isIdentifier({ name: 'getTranslations' })
        ) {
          const args = init.get('arguments')
          const nsArg = args[0]
          const namespace = nsArg?.isStringLiteral() ? nsArg.node.value : null
          translationVars.set(id.node.name, namespace)
        }
      }
    },

    CallExpression(path) {
      const callee = path.get('callee')

      if (callee.isIdentifier() && translationVars.has(callee.node.name)) {
        const tVar = callee.node.name
        const namespace = translationVars.get(tVar)
        const arg = path.node.arguments[0]
        if (arg?.type === 'StringLiteral') {
          const key = namespace ? `${namespace}.${arg.value}` : arg.value
          keys.add(key)
        }
      }

      if (
        callee.isMemberExpression() &&
        callee.get('property').isIdentifier({ name: 't' })
      ) {
        const obj = callee.get('object')
        if (obj.isIdentifier() && translationVars.has(obj.node.name)) {
          const namespace = translationVars.get(obj.node.name)
          const arg = path.node.arguments[0]
          if (arg?.type === 'StringLiteral') {
            const key = namespace ? `${namespace}.${arg.value}` : arg.value
            keys.add(key)
          }
        }
      }
    },

    // Extract string literals that start with any of the detected namespaces
    StringLiteral(path) {
      const value = path.node.value

      // Check whether the string starts with any of the detected namespaces
      for (const namespace of detectedNamespaces) {
        if (
          value.startsWith(`${namespace}.`) &&
          value.length > namespace.length + 1
        ) {
          keys.add(value)
          break
        }
      }
    },

    JSXOpeningElement(path) {
      const name = path.get('name')
      if (name.isJSXIdentifier({ name: 'Trans' })) {
        const idAttr = path
          .get('attributes')
          .find((attr) => attr.get('name').isJSXIdentifier({ name: 'id' }))
        if (idAttr) {
          const val = idAttr.get('value')
          if (val.isStringLiteral()) {
            keys.add(val.node.value) // assume full key already includes namespace
          }
        }
      }
    }
  })
}

// Build extraction tree
let extractedTree = {}
for (const key of keys) {
  const obj = expandKey(key)
  extractedTree = deepMerge(extractedTree, obj)
}

// Load existing translations
let existingTranslations = {}
try {
  const existingPath = path.join(projectRoot, EXISTING_TRANSLATIONS_FILE)
  const existingContent = await fs.readFile(existingPath, 'utf-8')
  existingTranslations = JSON.parse(existingContent)
  console.log(
    colorize(
      `Loaded existing translations from ${EXISTING_TRANSLATIONS_FILE}`,
      'gray'
    )
  )
} catch (err) {
  console.log(
    colorize(`Could not load existing translations: ${err.message}`, 'red')
  )
}

// Compare and find new keys
const existingKeysMap = flattenObject(existingTranslations)
const extractedKeys = flattenObject(extractedTree)

// New keys: keys found in code that are missing from existing translations OR that exist but have an empty value
const newKeys = Array.from(extractedKeys.keys()).filter(
  (key) => !existingKeysMap.has(key) || existingKeysMap.get(key) === ''
)

// Missing keys: keys present in existing translations that are no longer referenced in the code
const missingKeys = Array.from(existingKeysMap.keys()).filter(
  (key) => !extractedKeys.has(key)
)

console.log(`\n${colorize('Translation Keys Analysis:', 'blue')}`)
console.log(
  `   Found in codebase: ${colorize(extractedKeys.size, 'cyan')} keys`
)
console.log(
  `   Existing translations: ${colorize(existingKeysMap.size, 'cyan')} keys`
)
console.log(`   New keys to add: ${colorize(newKeys.length, 'green')} keys`)
console.log(
  `   Keys not found in code: ${colorize(missingKeys.length, 'red')} keys`
)

if (newKeys.length > 0) {
  console.log(`\n${colorize('New keys found in codebase:', 'green')}`)
  // Use Set to ensure uniqueness before output
  const uniqueNewKeys = [...new Set(newKeys)].sort()
  uniqueNewKeys.forEach((key) =>
    console.log(`   ${colorize('+', 'green')} ${key}`)
  )
}

if (missingKeys.length > 0) {
  console.log(`\n${colorize('Existing keys not found in codebase:', 'red')}`)
  // Use Set to ensure uniqueness before output
  const uniqueMissingKeys = [...new Set(missingKeys)].sort()
  uniqueMissingKeys.forEach((key) =>
    console.log(`   ${colorize('-', 'red')} ${key}`)
  )
}

// Update the original translations file with new keys
if (newKeys.length > 0) {
  const mergedTranslations = mergeTranslations(
    existingTranslations,
    extractedTree
  )
  const originalPath = path.join(projectRoot, EXISTING_TRANSLATIONS_FILE)
  await fs.writeFile(
    originalPath,
    JSON.stringify(mergedTranslations, null, 2),
    'utf-8'
  )
}

// Also save extracted file for debugging
const mergedTranslations = mergeTranslations(
  existingTranslations,
  extractedTree
)
const outputPath = path.join(projectRoot, OUTPUT_FILE)
await fs.writeFile(
  outputPath,
  JSON.stringify(mergedTranslations, null, 2),
  'utf-8'
)

console.log('\n')
