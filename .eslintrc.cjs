module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react-hooks'],
  ignorePatterns: ['dist', 'node_modules', '*.cjs', '*.js'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
  },
  overrides: [
    {
      // §1: the engine boundary. src/engine may import only from src/engine and src/data.
      files: ['src/engine/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              { group: ['react', 'react-*', 'zustand', 'framer-motion', 'idb-keyval'], message: 'src/engine is pure: no framework or storage imports.' },
              { group: ['**/ui/**', '../ui/*', '../../ui/*', '**/state/**', '**/art/**'], message: 'src/engine may only import from src/engine and src/data.' },
            ],
          },
        ],
      },
    },
    {
      files: ['src/**/*.tsx'],
      rules: { 'react-hooks/rules-of-hooks': 'error' },
    },
  ],
};
