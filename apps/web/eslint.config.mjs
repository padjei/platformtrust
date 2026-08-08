// Next.js flat ESLint config for apps/web.
// Uses FlatCompat to consume the eslintrc-style `eslint-config-next` presets
// on ESLint 9 (flat config). Run via `next lint`.
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: ['.next/**', 'coverage/**', 'dist/**', '.turbo/**', 'node_modules/**'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
