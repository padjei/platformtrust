#!/usr/bin/env bash
# PreToolUse guardrail: block reading .env and credential/secret files.
#
# Enforces the CLAUDE.md security rule that secrets/credentials must not be
# exposed. Blocks Read/Edit of credential files, and Bash commands that would
# cat/print them. `.env.example` (placeholders only) is always allowed.
#
# Fires on Read, Edit, and Bash. For Read/Edit it inspects the target path; for
# Bash it inspects the command string for a reference to a protected file.
set -euo pipefail

payload="$(cat)"
tool="$(printf '%s' "$payload" | jq -r '.tool_name // ""')"

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

# A path is protected if it looks like a real secret store. Allow *.env.example.
is_protected_path() {
  local p="$1"
  case "$p" in
    *.env.example|*/.env.example) return 1 ;;
  esac
  printf '%s' "$p" | grep -Eq \
    '(^|/)\.env(\.[A-Za-z0-9_-]+)?$|(^|/)\.env\.|(^|/)(secrets?|credentials?)(\.[A-Za-z0-9]+)?$|\.pem$|\.p12$|\.pfx$|(^|/)id_(rsa|ed25519|ecdsa)$|(^|/)\.npmrc$|(^|/)\.pgpass$|(^|/)\.aws/credentials$|(^|/)\.ssh/'
}

case "$tool" in
  Read|Edit|Write)
    file="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // ""')"
    [ -n "$file" ] || allow
    if is_protected_path "$file"; then
      deny "Blocked by project hook: '$file' looks like a credential/secret file. Reading or editing it risks exposing secrets (CLAUDE.md security rules). Use .env.example placeholders; load real secrets from the environment / Key Vault."
    fi
    ;;
  Bash)
    cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')"
    [ -n "$cmd" ] || allow
    # Only care about commands that read/print file contents.
    if printf '%s' "$cmd" | grep -Eq '\b(cat|less|more|head|tail|bat|xxd|od|strings|nl)\b'; then
      # Look for a protected-file reference, excluding *.env.example.
      if printf '%s' "$cmd" | grep -Eq '(^|[[:space:]"'"'"'/])\.env([[:space:]"'"'"'.]|$)' \
         && ! printf '%s' "$cmd" | grep -Eq '\.env\.example'; then
        deny "Blocked by project hook: this command would print a .env file. Secrets must not be exposed (CLAUDE.md). Read .env.example instead."
      fi
      if printf '%s' "$cmd" | grep -Eq '\.pem\b|id_(rsa|ed25519|ecdsa)\b|\.aws/credentials\b|\.pgpass\b'; then
        deny "Blocked by project hook: this command would print a credential/key file. Secrets must not be exposed (CLAUDE.md)."
      fi
    fi
    ;;
esac

allow
