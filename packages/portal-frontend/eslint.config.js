import pluginJs from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import prettierPlugin from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { readdirSync } from 'fs'

// Import specifiers must never name a tenant fork dir (`_<tenant>` segment).
// Tenant list mirrors the filesystem so it never drifts; Next.js private
// folders (_utils, _lib, …) can't match because they are not config instances.
// The standalone scripts/check-fork-imports.js guards .mdx, which ESLint skips.
const tenantForkPatterns = readdirSync(
  new URL('./src/configs', import.meta.url),
  { withFileTypes: true }
)
  .filter((entry) => entry.isDirectory() && entry.name !== 'defaults')
  .flatMap((entry) => [`**/_${entry.name}`, `**/_${entry.name}/**`])

export default [
  // Global ignores
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      'public/**',
      '**/*.d.ts',
      '**/*.tsbuildinfo',
      '**/*.log',
      '.eslintrc.cjs',
      'jest.config.js',
      'next.config.mjs',
      'scripts/**/*',
      'eslint.config.js',
      'cache-handler.js'
    ]
  },

  // Base configs
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules
    }
  },
  prettierPlugin,

  // Main configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        ...globals.jest
      }
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'simple-import-sort': simpleImportSortPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin
    },

    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          paths: ['.'],
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },

    rules: {
      // General rules
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-shadow': 'off',
      'no-bitwise': 'warn',
      'no-plusplus': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': 'off', // replaced by @typescript-eslint/no-unused-vars
      'no-nested-ternary': 'off',
      'no-restricted-exports': 'off',
      'no-use-before-define': 'error',
      'no-console': ['error', { allow: ['error'] }],
      'no-param-reassign': ['error', { props: false }],
      'global-require': 'off',
      'class-methods-use-this': 'off',
      yoda: 'off',

      // React rules
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      ],
      'react/no-array-index-key': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/destructuring-assignment': 'warn',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: ['arrow-function', 'function-declaration'],
          unnamedComponents: 'arrow-function'
        }
      ],

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules
      'import/order': 'off',
      'import/no-cycle': 'off',
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': 'off',

      // Simple import sort
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // TypeScript rules
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
      '@typescript-eslint/no-empty-function': 'warn',
      // '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' }
      ],

      // JSX a11y rules
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/control-has-associated-label': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/click-events-have-key-events': 'off'
    }
  },

  // Override for detailed import sorting
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Packages `react` related packages come first.
            ['^react', '^next', '^(?!.*services)\\w+[^/]*$'],
            ['^@next', '^@mui'],
            ['^@configs', '^@content', '^@template', '^@', '^assets'],
            // components mostly
            ['^\\w'],
            ['^services', '^providers', '^hooks', '^utils'],
            ['font', 'styles', 'css$'],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$']
          ]
        }
      ]
    }
  },

  // Icons must come from the @configs/icons registry — never imported directly.
  // The registry itself and the icon definitions are exempt.
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      '**/configs/**/icons.ts',
      '**/assets/icons/**',
      '**/MoveSmartlyInsights/icons/**'
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/icons-material',
              message:
                'Import icons from @configs/icons, not @mui/icons-material directly.'
            }
          ],
          patterns: [
            {
              group: ['@mui/icons-material/*'],
              message:
                'Import icons from @configs/icons, not @mui/icons-material directly.'
            },
            {
              group: ['@icons/*'],
              message:
                'Import icons from @configs/icons, not @icons/* directly.'
            },
            {
              group: tenantForkPatterns,
              message:
                'Never name a tenant fork in an import specifier. Import the default path (the override plugin resolves the fork); inside a fork use relative sibling imports; tenant-only components live in content/<tenant>/components.'
            }
          ]
        }
      ]
    }
  },

  // Test files configuration
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  }
]
