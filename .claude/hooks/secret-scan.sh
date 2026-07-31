#!/usr/bin/env bash
# PostToolUse/Write|Edit advisory: scan the just-written file for likely secrets.
#
# Supports the CLAUDE.md security rule "Never commit credentials, secrets,
# tokens, private keys, customer data, or PII". This hook is advisory: it never
# blocks the write, it surfaces a warning so the author can react before the
# secret reaches a commit. Deterministic secret scanning in CI (gitleaks) remains
# the authoritative gate.
set -euo pipefail

payload="$(cat)"
file="$(printf '%s' "$payload" | jq -r '.tool_response.filePath // .tool_input.file_path // ""')"

# Nothing to scan / file gone.
[ -n "$file" ] && [ -f "$file" ] || exit 0

# Placeholder files are expected to contain secret-shaped tokens.
case "$file" in
  *.env.example|*/.env.example|*.md|*.mdx) exit 0 ;;
esac

# High-signal secret patterns. Kept conservative to limit false positives.
patterns=(
  'BEGIN [A-Z ]*PRIVATE KEY'                 # PEM private keys
  'AKIA[0-9A-Z]{16}'                          # AWS access key id
  'aws_secret_access_key[[:space:]]*=[[:space:]]*[A-Za-z0-9/+]{40}'
  'xox[baprs]-[0-9A-Za-z-]{10,}'             # Slack tokens
  'gh[pousr]_[0-9A-Za-z]{30,}'               # GitHub tokens
  'sk-[A-Za-z0-9]{20,}'                       # generic provider secret keys
  '(password|passwd|secret|api[_-]?key|token|access[_-]?key)[[:space:]]*[:=][[:space:]]*["'"'"']?[A-Za-z0-9/+_.-]{12,}'
  'postgres(ql)?://[^:@/]+:[^@/]+@'           # DB URL with inline credentials
)

# Exclude obvious non-secrets to cut noise.
ignore='placeholder|example|changeme|change-me|your[_-]|xxxx|<[^>]+>|\$\{|dummy|redacted|sample|test[_-]?(key|token|secret)'

hits=""
for pat in "${patterns[@]}"; do
  match="$(grep -EnI "$pat" "$file" 2>/dev/null | grep -Evi "$ignore" | head -3 || true)"
  if [ -n "$match" ]; then
    # Report line numbers and pattern, never the matched secret value.
    lines="$(printf '%s' "$match" | cut -d: -f1 | paste -sd, -)"
    hits="${hits}\n  - possible secret near line(s) ${lines}"
  fi
done

if [ -n "$hits" ]; then
  msg="$(printf 'Possible secret detected in %s:%b\nReview before committing — never commit real credentials/PII. CI gitleaks will block them.' "$file" "$hits")"
  jq -n --arg m "$msg" '{systemMessage: $m, suppressOutput: true}'
fi

exit 0
