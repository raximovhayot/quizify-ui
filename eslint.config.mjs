import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/*.css',
      '**/*.json',
      '**/*.ico',
      '**/*.png',
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.gif',
      '**/*.svg',
      'node_modules/**',
      '.next/**',
      'out/**',
    ],
  },
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/recommended'
  ),
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['./src/**/*.*'],
    rules: {
      'no-process-env': 'error',
    },
  },
  {
    files: ['*.stories.tsx', './src/i18n/**/*', './src/theme/**/*.ts'],
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  },
];

export default eslintConfig;
