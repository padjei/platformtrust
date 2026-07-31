#!/usr/bin/env bash
# PostToolUse/Write|Edit: best-effort auto lint/format of the file just written.
#
# Advisory and non-blocking: formats with the project's tools when available,
# and stays silent (never fails the write) when a tool is missing. Python uses
# Ruff; TypeScript/JavaScript uses the project's ESLint via npx.
set -euo pipefail

payload="$(cat)"
file="$(printf '%s' "$payload" | jq -r '.tool_response.filePath // .tool_input.file_path // ""')"

[ -n "$file" ] && [ -f "$file" ] || exit 0

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

format_python() {
  # Prefer an activated/venv ruff, then PATH, then uvx as a fallback.
  local ruff=""
  if [ -x "$repo_root/services/api/.venv/bin/ruff" ]; then
    ruff="$repo_root/services/api/.venv/bin/ruff"
  elif command -v ruff >/dev/null 2>&1; then
    ruff="ruff"
  elif command -v uvx >/dev/null 2>&1; then
    ruff="uvx ruff"
  else
    return 0
  fi
  $ruff format "$file" >/dev/null 2>&1 || true
  $ruff check --fix "$file" >/dev/null 2>&1 || true
}

format_web() {
  # Only attempt if the web app has its toolchain installed.
  local web="$repo_root/apps/web"
  [ -d "$web/node_modules" ] || return 0
  command -v npx >/dev/null 2>&1 || return 0
  ( cd "$web" && npx --no-install eslint --fix "$file" >/dev/null 2>&1 ) || true
}

case "$file" in
  *.py)                       format_python ;;
  *.ts|*.tsx|*.js|*.jsx|*.mjs) format_web ;;
  *) : ;;
esac

exit 0
