/**
 * @platformtrust/config
 *
 * Shared configuration metadata for the PlatformTrust monorepo.
 *
 * This package intentionally contains NO business logic. It exposes small,
 * typed constants and helpers describing where the shared tooling
 * configuration lives (the base TypeScript config, the flat ESLint config and
 * the Prettier config) so that packages and apps can reference these locations
 * consistently instead of hard-coding relative paths in multiple places.
 */

/**
 * Relative path, from a package located at `packages/<name>` or `apps/<name>`,
 * to the shared base TypeScript configuration at the repository root.
 */
export const BASE_TSCONFIG_RELATIVE_PATH = '../../tsconfig.base.json' as const;

/** Filename of the shared flat ESLint configuration at the repository root. */
export const SHARED_ESLINT_CONFIG_FILENAME = 'eslint.config.mjs' as const;

/** Filename of the shared Prettier configuration at the repository root. */
export const SHARED_PRETTIER_CONFIG_FILENAME = '.prettierrc.json' as const;

/**
 * Structured metadata describing the shared tooling configuration files.
 * Consumers can read these values rather than duplicating literals.
 */
export interface SharedConfigMetadata {
  /** Relative path to the base tsconfig from a first-level workspace package. */
  readonly baseTsconfigRelativePath: string;
  /** Filename of the shared ESLint config at the repository root. */
  readonly eslintConfigFilename: string;
  /** Filename of the shared Prettier config at the repository root. */
  readonly prettierConfigFilename: string;
}

/** Frozen, ready-to-use instance of {@link SharedConfigMetadata}. */
export const sharedConfigMetadata: SharedConfigMetadata = Object.freeze({
  baseTsconfigRelativePath: BASE_TSCONFIG_RELATIVE_PATH,
  eslintConfigFilename: SHARED_ESLINT_CONFIG_FILENAME,
  prettierConfigFilename: SHARED_PRETTIER_CONFIG_FILENAME,
});

/**
 * Build the relative path from a workspace package to the shared base tsconfig,
 * given how many directory levels deep the package sits below the repository
 * root. Workspaces such as `packages/<name>` are two levels deep (the default).
 *
 * @param depthFromRoot - Number of directory segments between the repo root and
 *   the package. Defaults to `2` (e.g. `packages/config`).
 * @returns A relative path such as `../../tsconfig.base.json`.
 */
export function resolveBaseTsconfigPath(depthFromRoot = 2): string {
  if (!Number.isInteger(depthFromRoot) || depthFromRoot < 1) {
    throw new RangeError('depthFromRoot must be an integer greater than or equal to 1');
  }
  return `${'../'.repeat(depthFromRoot)}tsconfig.base.json`;
}
