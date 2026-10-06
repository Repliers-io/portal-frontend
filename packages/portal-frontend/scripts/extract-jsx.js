// scripts/extract-jsx-strings.js
import fs from 'fs'
import path from 'path'
import { parse } from '@babel/parser'
import babelTraverse from '@babel/traverse'

const traverse = babelTraverse.default || babelTraverse

function extractStringsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy']
    })

    const strings = []

    traverse(ast, {
      // JSX text: <div>Hello World</div>
      JSXText(path) {
        const value = path.node.value.trim()
        if (value && isUserString(value)) {
          strings.push({
            type: 'jsx-text',
            value,
            line: path.node.loc.start.line,
            file: filePath.replace(/\\/g, '/')
          })
        }
      },

      // JSX attributes: <input placeholder="Search..." />
      JSXAttribute(path) {
        if (path.node.value && path.node.value.type === 'StringLiteral') {
          const value = path.node.value.value
          const attrName = path.node.name.name

          if (isUserFacingAttribute(attrName) && isUserString(value)) {
            strings.push({
              type: 'jsx-attribute',
              attribute: attrName,
              value,
              line: path.node.loc.start.line,
              file: filePath.replace(/\\/g, '/')
            })
          }
        }
      }

      // EXCLUDE StringLiteral completely!
    })

    return strings
  } catch (error) {
    console.warn(`Parsing error ${filePath}:`, error.message)
    return []
  }
}

function isUserString(str) {
  if (!str || str.length < 2 || str.length > 200) return false

  // Exclude technical strings
  const excludePatterns = [
    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, // variables
    /^\/[a-zA-Z0-9\/_-]*$/, // paths
    /^#[0-9a-fA-F]{3,8}$/, // colors
    /^\d+(\.\d+)?(px|em|rem|%|vh|vw)$/, // CSS values
    /^[a-z-]+$/, // CSS classes without spaces
    /^data-/, // data attributes
    /^aria-/, // aria attributes
    /^https?:\/\//, // URLs
    /^mailto:/, // email links
    /^tel:/, // phone links
    /^\$+$/, // only dollar signs
    /^[0-9\.,\s]+$/, // only numbers and separators
    /^[A-Z_][A-Z0-9_]*$/ // constants in UPPER_CASE
  ]

  if (excludePatterns.some((pattern) => pattern.test(str))) return false

  // Include strings with spaces, punctuation or Cyrillic
  return /[\s\p{P}\p{Script=Cyrillic}]/u.test(str) && /[\p{L}]/u.test(str)
}

function isUserFacingAttribute(attrName) {
  return [
    'placeholder',
    'title',
    'alt',
    'aria-label',
    'aria-description',
    'label',
    'value' // for some cases
  ].includes(attrName)
}

// Paths/patterns to exclude from scanning
const blacklist = [
  '/debug/',
  '/demo/',
  '/estimate/Banners/',
  '/test/', // test files
  '/__tests__/', // test directories
  '.test.tsx',
  '.test.jsx',
  '.spec.tsx',
  '.spec.jsx'
]

function blacklisted(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/')
  return blacklist.some((pattern) => normalizedPath.includes(pattern))
}

function scanProject(srcPath, filter) {
  const allStrings = []

  function matchesFilter(filePath) {
    if (!filter) return true

    // Convert to forward slashes for consistent matching
    const normalizedPath = filePath.replace(/\\/g, '/')

    // Check if filter matches any part of the path or filename
    return normalizedPath.toLowerCase().includes(filter.toLowerCase())
  }

  function scanDir(dirPath) {
    const items = fs.readdirSync(dirPath)

    for (const item of items) {
      const fullPath = path.join(dirPath, item)
      const stat = fs.statSync(fullPath)

      if (
        stat.isDirectory() &&
        !['node_modules', '.next', '.git'].includes(item)
      ) {
        scanDir(fullPath)
      } else if (stat.isFile() && /\.(tsx|jsx)$/.test(item)) {
        if (matchesFilter(fullPath) && !blacklisted(fullPath)) {
          const strings = extractStringsFromFile(fullPath)
          allStrings.push(...strings)
        }
      }
    }
  }

  scanDir(srcPath)
  return allStrings
}

// Run the script
function main() {
  // Get command line arguments
  const args = process.argv.slice(2)
  const filter = args[0] // First argument as filter

  const strings = scanProject('./src', filter)

  // Group by types
  const byType = strings.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || []
    acc[item.type].push(item)
    return acc
  }, {})

  // ANSI color codes
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  }

  // Function to trim and add ellipsis for long strings
  function formatString(str) {
    // Replace newlines with spaces and trim
    const cleaned = str.replace(/\n/g, ' ').trim()

    if (cleaned.length > 50 || str.includes('\n')) {
      return cleaned.substring(0, 50) + '...'
    }
    return cleaned
  }

  // Show filter info if applied
  if (filter) {
    console.log(
      `\n${colors.bright}${colors.cyan}FILTER: ${filter}${colors.reset}`
    )
  }

  Object.entries(byType).forEach(([type, items]) => {
    const typeColor = type === 'jsx-text' ? colors.green : colors.blue
    console.log(
      `\n${colors.bright}${typeColor}${type.toUpperCase()}: ${items.length} strings${colors.reset}`
    )

    items.slice(0, 20).forEach((item) => {
      const formattedValue = formatString(item.value)
      const relativePath = path.relative('.', item.file).replace(/\\/g, '/')

      console.log(
        `  ${colors.yellow}"${formattedValue}"${colors.reset} ${colors.dim}(${relativePath}:${item.line})${colors.reset}`
      )
    })

    if (items.length > 20) {
      console.log(`  ... and ${items.length - 20} more`)
    }
  })

  // Save results
  fs.writeFileSync(
    './src/i18n/extracted-strings.json',
    JSON.stringify(strings, null, 2)
  )

  console.log(
    `\n${colors.dim}Saved ${strings.length} user-facing strings to ./src/i18n/extracted-strings.json${colors.reset}\n\n`
  )
}

main()
