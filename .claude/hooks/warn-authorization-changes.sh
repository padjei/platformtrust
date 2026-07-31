#!/usr/bin/env bash
# PostToolUse/Write|Edit advisory: warn when authorization/tenancy code changes.
#
# Authorization and tenant-isolation logic is security-critical. When a file in
# an auth/authz/tenancy/RBAC area is modified, surface a reminder to re-check
# server-side enforcement, tenant scoping, and test coverage. Advisory only —
# never blocks the edit.
set -euo pipefail

payload="$(cat)"
file="$(printf '%s' "$payload" | jq -r '.tool_response.filePath // .tool_input.file_path // ""')"

[ -n "$file" ] || exit 0

# Match auth/authorization/tenancy modules by path or filename. Excludes docs.
case "$file" in
  *.md|*.mdx) exit 0 ;;
esac

if printf '%s' "$file" | grep -Eiq \
  '(^|/)(auth|authz|authorization|permission|permissions|rbac|policy|policies|tenant|tenancy|rls)([._/-]|s?\.[a-z]+$)'; then
  msg="$(cat <<MSG
Authorization/tenancy-sensitive file changed: $file
Before committing, verify:
  - authorization is enforced server-side (never trust the client)
  - tenant_id is derived from the authenticated context, not client input
  - PostgreSQL RLS still applies to any tenant-owned table touched
  - tests cover the deny path and cross-tenant isolation
  - a privileged action writes an audit event
See docs/security/AUTHORIZATION_MODEL.md and docs/security/TENANT_ISOLATION.md
MSG
)"
  jq -n --arg m "$msg" '{systemMessage: $m, suppressOutput: true}'
fi

exit 0
