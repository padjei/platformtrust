#!/usr/bin/env bash
# PreToolUse/Edit|Write guardrail: block modifying an already-committed migration.
#
# Enforces the CLAUDE.md / database rule "Do not modify existing migrations after
# they have been committed" — existing migrations are immutable; add a new one.
# A migration file that is not yet in HEAD (newly created, uncommitted) is fine
# to edit. Non-migration files always pass through.
set -euo pipefail

payload="$(cat)"
file="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // ""')"

allow() { exit 0; }

deny() {
  local reason="$1"
  jq -n --arg reason "$reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

[ -n "$file" ] || allow

# Only guard Alembic migration version files.
case "$file" in
  */migrations/versions/*.py) ;;
  *) allow ;;
esac

command -v git >/dev/null 2>&1 || allow

# Resolve the path relative to the repo root so `git cat-file` can find it.
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "$repo_root" ] || allow

# Normalize to a repo-relative path.
case "$file" in
  /*) rel="${file#"$repo_root"/}" ;;
  *)  rel="$file" ;;
esac

# If the file exists in HEAD it has been committed → immutable.
if git cat-file -e "HEAD:$rel" 2>/dev/null; then
  deny "Blocked by project hook: '$rel' is a committed migration and must not be modified (CLAUDE.md: do not modify migrations after they are committed). Create a NEW migration instead."
fi

allow
