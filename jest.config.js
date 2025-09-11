/** @type {import('ts-jest').JestConfigWithTsJest} */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { pathsToModuleNameMapper } from 'ts-jest'

const tsconfig = JSON.parse(readFileSync(resolve('./tsconfig.json'), 'utf8'))
const { compilerOptions } = tsconfig

const config = {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          ...compilerOptions,
          verbatimModuleSyntax: false // disable it for tests
        }
      }
    ]
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/src/',
      useESM: true
    })
  },
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/public/',
    '<rootDir>/.next/'
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/utils/**/*.{ts,tsx}',
    '<rootDir>/src/**/{utils,_utils}.ts'
  ],
  coveragePathIgnorePatterns: ['<rootDir>/src/utils/dataMapper/'],
  coverageThreshold: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}

export default config
