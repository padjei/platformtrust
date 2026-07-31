#!/usr/bin/env bash
# PreToolUse/Bash guardrail: block destructive / irreversible shell commands.
#
# Stops accidental data loss and dangerous operations. Denies recursive force
# deletes of broad paths, disk-wipe tools, history-rewriting force pushes,
# destructive git resets/cleans, and database drop/truncate statements. Normal
# development commands pass through.
set -euo pipefail

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

[ -n "$cmd" ] || allow

# Each entry: <regex>::<human reason>
rules=(
  'rm[[:space:]]+(-[a-zA-Z]*[rR][a-zA-Z]*[[:space:]]+)*(-[a-zA-Z]*[fF][a-zA-Z]*[[:space:]]+)*(/|~|\$HOME|\.|\*)([[:space:]]|$)::recursive force delete of a broad path (rm -rf on /, ~, ., or *)'
  'rm[[:space:]]+-[a-zA-Z]*[fF][a-zA-Z]*[rR]::recursive force delete (rm -fr)'
  '\bmkfs(\.[a-z0-9]+)?\b::filesystem format (mkfs)'
  '\bdd[[:space:]]+.*of=/dev/::raw disk write (dd to a device)'
  '[:(][[:space:]]*[{][[:space:]]*:[[:space:]]*[|][[:space:]]*:[[:space:]]*[&]::fork bomb'
  '>[[:space:]]*/dev/(sd|nvme|disk)::overwrite a block device'
  '\bgit[[:space:]]+push[[:space:]]+.*--force\b::force push (history rewrite); use --force-with-lease and a feature branch'
  '\bgit[[:space:]]+push[[:space:]]+.*-f\b::force push (history rewrite); use --force-with-lease and a feature branch'
  '\bgit[[:space:]]+reset[[:space:]]+--hard\b::destructive git reset --hard (discards changes)'
  '\bgit[[:space:]]+clean[[:space:]]+-[a-zA-Z]*[fd]::git clean -fd (deletes untracked files)'
  '\bDROP[[:space:]]+(DATABASE|SCHEMA|TABLE)\b::destructive SQL (DROP)'
  '\bTRUNCATE[[:space:]]+::destructive SQL (TRUNCATE)'
  '\bchmod[[:space:]]+-R[[:space:]]+777\b::insecure recursive chmod 777'
)

for rule in "${rules[@]}"; do
  pat="${rule%%::*}"
  reason="${rule#*::}"
  if printf '%s' "$cmd" | grep -Eiq "$pat"; then
    deny "Blocked by project hook: $reason. If this is truly intended, run it manually outside Claude or disable this hook via /hooks."
  fi
done

allow
