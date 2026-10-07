/** @type {import('jest').Config} */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const tsconfig = JSON.parse(readFileSync(resolve('./tsconfig.json'), 'utf8'))
const { compilerOptions } = tsconfig

function pathsToModuleNameMapper(paths, options = {}) {
  const { prefix = '' } = options
  const moduleNameMapper = {}

  for (const [key, values] of Object.entries(paths)) {
    const jestKey = key.replace(/\*/g, '(.*)').replace(/\$/g, '\\$')
    const jestValue = values[values.length - 1].replace(/\*/g, '$1')
    moduleNameMapper[`^${jestKey}$`] = `${prefix}${jestValue}`
  }

  return moduleNameMapper
}

const esmPackages = [
  'd3-array',
  'd3-geo',
  'decode-uri-component',
  'filter-obj',
  'internmap',
  'kdbush',
  'marked',
  'p-throttle',
  'query-string',
  'split-on-first',
  'supercluster'
]

const config = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: 'inline',
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true
          },
          transform: {
            react: {
              runtime: 'automatic'
            }
          },
          target: 'es2021'
        },
        module: {
          type: 'commonjs'
        }
      }
    ]
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/src/'
    })
  },
  // Only ESM-only packages go through SWC; the rest of node_modules is CJS
  transformIgnorePatterns: [
    `/node_modules/(?!\\.pnpm/|(${esmPackages.join('|')})/)`
  ],
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/public/',
    '<rootDir>/.next/',
    '<rootDir>/src/e2e/'
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  collectCoverageFrom: [
    '<rootDir>/src/utils/**/*.{ts,tsx}',
    '<rootDir>/src/**/{utils,_utils}.ts',
    '!**/*.test.{ts,tsx}'
  ],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  coverageThreshold: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}

export default config
