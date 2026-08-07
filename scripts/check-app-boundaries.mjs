#!/usr/bin/env node
// @ts-check
/**
 * Architecture boundary check (dependency-free).
 *
 * PlatformTrust is a modular system. Each application under `apps/*` is an
 * independent deployable and MUST NOT import from another application's source.
 * Applications MAY depend on shared libraries under `packages/*` (published as
 * `@platformtrust/<pkg>`), but never on `@platformtrust/web|api|worker|ai-service`
 * as if those apps were libraries, and never by reaching into a sibling app's
 * source with a relative path or an `apps/<other>/...` specifier.
 *
 * Exits non-zero and lists every violation when boundaries are crossed.
 * Exits 0 when clean.
 *
 * No external dependencies. Node ESM.
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const appsDir = join(repoRoot, 'apps');

/** Directories inside each app that hold first-party source we scan. */
const SCAN_SUBDIRS = ['src', 'app', 'tests'];
/** Extensions we analyze. */
const EXTENSIONS = new Set(['.ts', '.tsx']);

if (!existsSync(appsDir)) {
  console.error('check-app-boundaries: no apps/ directory found; nothing to check.');
  process.exit(0);
}

/** @returns {string[]} the app directory names under apps/ */
function listApps() {
  return readdirSync(appsDir).filter((name) => {
    const full = join(appsDir, name);
    return statSync(full).isDirectory();
  });
}

const APP_NAMES = new Set(listApps());

/**
 * Recursively collect files with a matching extension under `dir`.
 * @param {string} dir
 * @param {string[]} out
 */
function walk(dir, out) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile()) {
      const dot = entry.name.lastIndexOf('.');
      if (dot !== -1 && EXTENSIONS.has(entry.name.slice(dot))) out.push(full);
    }
  }
}

/**
 * Extract module specifiers from static imports/exports, dynamic import(), and require().
 * Deliberately simple and conservative — good enough for boundary detection.
 * @param {string} source
 * @returns {string[]}
 */
function extractSpecifiers(source) {
  const specs = [];
  const patterns = [
    // import ... from '...'  /  export ... from '...'
    /(?:^|[^\w$])(?:import|export)\s[^;'"]*?\sfrom\s*['"]([^'"]+)['"]/g,
    // bare side-effect import: import '...'
    /(?:^|[^\w$])import\s*['"]([^'"]+)['"]/g,
    // dynamic import('...')
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // require('...')
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(source)) !== null) specs.push(m[1]);
  }
  return specs;
}

/**
 * Given an absolute file path, return the owning app name, or null.
 * @param {string} absFile
 * @returns {string | null}
 */
function appOf(absFile) {
  const rel = relative(appsDir, absFile);
  if (rel.startsWith('..') || rel.startsWith(sep)) return null;
  const first = rel.split(sep)[0];
  return APP_NAMES.has(first) ? first : null;
}

/** @type {{file: string, spec: string, reason: string}[]} */
const violations = [];

for (const app of APP_NAMES) {
  for (const sub of SCAN_SUBDIRS) {
    /** @type {string[]} */
    const files = [];
    walk(join(appsDir, app, sub), files);

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const spec of extractSpecifiers(source)) {
        // 1) App package name used as if it were a library: @platformtrust/<appname>
        const scoped = /^@platformtrust\/([^/]+)/.exec(spec);
        if (scoped && APP_NAMES.has(scoped[1]) && scoped[1] !== app) {
          violations.push({
            file,
            spec,
            reason: `imports another app's package "@platformtrust/${scoped[1]}" (apps are not libraries)`,
          });
          continue;
        }

        // 2) Path specifier that names another app directly: apps/<other>/...
        const appsPath = /(?:^|\/)apps\/([^/]+)/.exec(spec);
        if (appsPath && APP_NAMES.has(appsPath[1]) && appsPath[1] !== app) {
          violations.push({
            file,
            spec,
            reason: `imports into sibling app "apps/${appsPath[1]}" via path specifier`,
          });
          continue;
        }

        // 3) Relative import that climbs into a sibling app's source.
        if (spec.startsWith('.')) {
          const resolved = resolve(dirname(file), spec);
          const targetApp = appOf(resolved);
          if (targetApp && targetApp !== app) {
            violations.push({
              file,
              spec,
              reason: `relative import resolves into sibling app "${targetApp}"`,
            });
          }
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error('\nArchitecture boundary check FAILED.');
  console.error('Applications must not import from other applications.');
  console.error('Use shared code in packages/* (@platformtrust/<pkg>) instead.\n');
  for (const v of violations) {
    console.error(`  ${relative(repoRoot, v.file)}`);
    console.error(`    -> "${v.spec}"  (${v.reason})`);
  }
  console.error(`\n${violations.length} violation(s) found.`);
  process.exit(1);
}

console.log('Architecture boundary check passed: no cross-application imports found.');
process.exit(0);
