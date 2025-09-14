const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended'
  ],
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
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
    'react-hooks/exhaustive-deps': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: ['arrow-function', 'function-declaration'],
        unnamedComponents: 'arrow-function'
      }
    ],
    '@next/next/no-img-element': 'warn',
    'no-shadow': 'off',
    'no-undef': 'error',
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
    'import/order': 'off',
    'import/no-cycle': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
    '@typescript-eslint/no-empty-function': 'warn',
    // '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { fixStyle: 'inline-type-imports' }
    ],
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/control-has-associated-label': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/click-events-have-key-events': 'off',
    yoda: 'off'
  },
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
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
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      env: {
        jest: true
      }
    }
  ],
  env: {
    jest: true,
    browser: true,
    node: true
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['.'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
}

module.exports = config
