#!/usr/bin/env bash
# PreToolUse/Bash guardrail: hard-block `git push` targeting main/master.
#
# Enforces the CLAUDE.md rule "Never push directly to `main`". Reads the hook
# payload on stdin, inspects the Bash command, and denies the tool call when it
# would push to the protected branch. All other commands pass through untouched.
#
# Deny is expressed via PreToolUse permissionDecision JSON. A developer who
# genuinely needs to override can disable the hook from the /hooks menu.
set -euo pipefail

PROTECTED_BRANCHES_REGEX='^(main|master)$'

payload="$(cat)"
cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')"

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

# Only concerned with git push invocations.
if ! printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push'; then
  allow
fi

# Explicit protected-branch target: `... main`, `... master`, or a `:main`
# refspec (e.g. `git push origin HEAD:main`).
if printf '%s' "$cmd" | grep -Eq '(^|[[:space:]:/])(main|master)([[:space:]]|$)'; then
  deny "Blocked by project hook: pushing to main/master is not allowed (CLAUDE.md: never push directly to main). Open a PR from a feature branch instead."
fi

# Bare `git push` (no explicit refspec) pushes the current branch. Block if the
# current branch is protected. Guard with `git` availability and a repo check.
if command -v git >/dev/null 2>&1; then
  if current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"; then
    if printf '%s' "$current_branch" | grep -Eq "$PROTECTED_BRANCHES_REGEX"; then
      # A bare push from a protected branch (no other branch named in the command).
      if ! printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push[[:space:]]+[^[:space:]]+[[:space:]]+[^[:space:]-]'; then
        deny "Blocked by project hook: you are on '$current_branch'; a bare 'git push' would push to it. Switch to a feature branch and open a PR (CLAUDE.md: never push directly to main)."
      fi
    fi
  fi
fi

allow
