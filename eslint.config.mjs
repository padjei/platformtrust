// Flat ESLint config shared across the monorepo.
// Applications and packages may extend this with framework-specific rules.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/*.tsbuildinfo',
      // Python service is linted by Ruff, not ESLint.
      'apps/ai-service/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  // Disable stylistic rules that conflict with Prettier.
  prettier,
);
