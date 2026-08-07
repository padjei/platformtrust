/**
 * Commitlint configuration — enforces Conventional Commits.
 * See docs/handbook/ENGINEERING_HANDBOOK.md §12 (Commit conventions).
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'security', 'revert'],
    ],
    'subject-case': [0],
  },
};
