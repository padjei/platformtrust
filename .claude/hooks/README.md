# Project Hooks

Claude Code hooks that enforce the rules in `CLAUDE.md` and `.claude/rules/`.
Hooks are wired in `.claude/settings.json`; the scripts live in this directory.

## Implemented

| Hook | Event / matcher | Script | Enforcement |
|------|-----------------|--------|-------------|
| Block direct changes to released migrations | PreToolUse / Edit\|Write | `protect-committed-migrations.sh` | Hard block (files present in `HEAD`) |
| Prevent direct production deployment commands | PreToolUse / Bash | `block-push-to-main.sh` | Hard block (`git push` to main/master) |
| Block destructive shell commands | PreToolUse / Bash | `block-destructive-shell.sh` | Hard block (rm -rf broad paths, force push, reset --hard, DROP/TRUNCATE, mkfs/dd, …) |
| Block access to `.env` and credential files | PreToolUse / Read\|Edit\|Write\|Bash | `block-credential-file-access.sh` | Hard block (`.env`, keys, `.aws/credentials`, `.ssh/`; `.env.example` allowed) |
| Prevent commits containing secrets | PostToolUse / Write\|Edit | `secret-scan.sh` | Advisory (warns; CI gitleaks is the gate) |
| Run formatting after edits | PostToolUse / Write\|Edit | `auto-format.sh` | Best-effort (Ruff / ESLint) |
| Run targeted tests after backend changes | PostToolUse / Write\|Edit | `run-targeted-backend-tests.sh` | Advisory (runs matching `test_<name>.py`; CI is the gate) |
| Warn when code touches authorization modules | PostToolUse / Write\|Edit | `warn-authorization-changes.sh` | Advisory (reminder to re-check authz/tenancy) |

All eight hooks from the original roadmap are now implemented.

## Notes

- Hard-block guardrails are overridable via the `/hooks` menu; they are strong
  defaults, not a substitute for GitHub branch protection and CI.
- Editing `.claude/settings.json` mid-session may require opening `/hooks` once
  (or restarting) before new hooks fire.
